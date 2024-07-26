import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const AllComments = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        }
    ])

    if (!AllComments) {
        throw new ApiError(400, "Failed to fetch video comments !")
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const finalComments = await Comment.aggregatePaginate(
        AllComments,
        options
    ) 

    return res
        .status(200)
        .json(new ApiResponse(200, finalComments, "Video comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const  { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    if (content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(400, "Failed to add new comment !")
    }

    return res 
        .status(200)
        .json(new ApiResponse(200, comment, "New comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    if (content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400 , "You are not authorized to update this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    if (!updatedComment) {
        throw new ApiError(400, "Failed to update comment !")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment Id")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403 , "You are not Authorized to perform this action")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    
    if (!deletedComment) {
        throw new ApiError(400, "Failed to delete commment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
    