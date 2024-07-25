import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !description || name.trim() === "" || description.trim() === "") {
        throw new ApiError(400, "Playlist name and decription is required");
    }

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!createdPlaylist) {
        throw new ApiError(400, "Failed to create playlist !")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdPlaylist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id")
    }

    const AllPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                PlaylistThumbnail: {
                    $first: "$videos.thumbnail"
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1,
                PlaylistThumbnail: 1
            }
        }
    ])

    if (!AllPlaylists) {
        throw new ApiError(400, "Failed to get user playlists")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, AllPlaylists, "User playlists feetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "Playlist not found");
    }

    const playlistVideos = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $match: {
                "videos.isPublished": true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1
                },
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                }
            }
        }
        
    ])

    if (!playlistVideos) {
        throw new ApiError(400, "Failed to fetch Playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlistVideos, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist Id or video Id")
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new ApiError(400, "Playlist not found");
    }
    if (!video) {
        throw new ApiError(400, "video not found");
    }

    if (user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $addToSet: {
                videos: videoId,
            },
        },
        { new: true }
    )

    if (!updatedPlaylist) {
        throw new ApiError(400, "Failed to add video to playlist !")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist Id or video Id");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    if (playlist?.owner.toString() !== user?._id.toString()) {
        throw new ApiError(403, "Unauthorized access, you are not allowed to perform this action")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId,
            }
        },
        { new: true }
    )

    if (!updatedPlaylist) {
        throw new ApiError(400, "Failed to remove a video from playlist !")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Unauthorized access, you are not allowed to perform this action");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletedPlaylist) {
        throw new ApiError(400, "Failed to delete playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id")
    }

    if (!name || !description || name?.trim() == "" || description?.trim() == "") {
        throw new ApiError(400, "Playlist name and description both are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    if (playlist?.owner.toString() !== user?._id.toString()) {
        throw new ApiError(403, "Unauthorized access, you are not allowed to perform this action")
    }

    const updatedPlayList = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        { new: true}
    )

    if (!updatedPlayList) {
        throw new ApiError(400, "Failed to update playlist !")
    }

    return res 
        .status(200)
        .json(new ApiResponse(200, updatedPlayList, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}