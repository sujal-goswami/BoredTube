import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
	const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

	const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                subscribersCount: {
                    $sum: 1
                }
            }
        }
    ]);

    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",
                totalVideos: 1
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes"
                },
                totalViews: {
                    $sum: "$totalViews"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        }
    ]);

    const channelStats = {
        totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
        totalLikes: video[0]?.totalLikes || 0,
        totalViews: video[0]?.totalViews || 0,
        totalVideos: video[0]?.totalVideos || 0
    };

	return res
	.status(200)
	.json(new ApiResponse(200, channelStats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
            }
        },
		{
            $addFields: {
                createdAt: {
					$dateToParts: { date: "$createdAt" }
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
            title: 1,
            description: 1,
            thumbnail: "$thumbnail.url",
            videoFile: "$videoFile.url",
            views: 1,
            duration: 1,
            isPublished: 1,
			createdAt: 1
            }
        },
    ]);

	if (!videos) {
		throw new ApiError(400, "Videos not fetched successfully")
	}

	return res
	.status(200)
	.json(new ApiResponse(200, videos, "Channel all videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }