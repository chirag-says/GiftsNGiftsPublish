import React from 'react';
import DOMPurify from 'dompurify';
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import { Link } from 'react-router-dom';
import {
    HiStar,
    HiOutlineThumbUp,
    HiUser,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { FaStar, FaStarHalfAlt, FaRegStar, FaQuoteLeft } from "react-icons/fa";

/**
 * SECURITY: Sanitize user-generated content
 * DOMPurify removes any HTML/JavaScript to prevent XSS attacks
 */
const sanitize = (text) => {
    if (!text) return '';
    // DOMPurify.sanitize strips all HTML tags by default
    // We force text-only output to be extra safe
    return DOMPurify.sanitize(String(text), {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: []  // No attributes allowed
    });
};

/**
 * ReviewCard Component
 * Individual review display with verified badge
 * 
 * SECURITY: All user-generated content is sanitized via DOMPurify
 * to prevent Persistent XSS attacks from malicious review content.
 */
export const ReviewCard = ({ review }) => {
    // SECURITY: Sanitize all user-generated content before rendering
    const safeUserName = sanitize(review.userName);
    const safeTitle = sanitize(review.title);
    const safeComment = sanitize(review.comment);
    const safeSellerResponse = sanitize(review.sellerResponse);

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex gap-4">
                <Avatar sx={{
                    bgcolor: review.isVerifiedPurchase ? '#059669' : '#6366f1',
                    width: 48,
                    height: 48,
                    fontWeight: 'bold'
                }}>
                    {safeUserName?.charAt(0).toUpperCase()}
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h4 className="font-semibold text-gray-800">{safeUserName}</h4>
                        {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                <MdVerified size={12} /> Verified
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex" role="img" aria-label={`${review.rating} out of 5 stars`}>
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        {safeTitle && <span className="font-medium text-gray-700">{safeTitle}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                    {safeComment && (
                        <p className="text-gray-700 leading-relaxed">{safeComment}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition"
                            aria-label={`Mark review as helpful. Currently ${review.helpful || 0} people found this helpful`}
                        >
                            <HiOutlineThumbUp /> Helpful ({review.helpful || 0})
                        </button>
                    </div>
                    {safeSellerResponse && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border-l-4 border-indigo-400">
                            <p className="text-indigo-600 text-xs font-semibold mb-1">Seller Response</p>
                            <p className="text-sm text-gray-700">{safeSellerResponse}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * RatingBar Component
 * Visual rating distribution bar
 */
export const RatingBar = ({ rating, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3 text-sm group cursor-pointer">
            <span className="w-8 text-gray-600 font-medium">{rating}</span>
            <div className="flex gap-1" role="img" aria-label={`${rating} stars`}>
                {[...Array(5)].map((_, i) => (
                    <HiStar key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`} />
                ))}
            </div>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 group-hover:from-amber-500 group-hover:to-amber-600"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-12 text-gray-500 text-xs text-right">{count}</span>
        </div>
    );
};

/**
 * Helper function to render star ratings
 */
export const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) stars.push(<FaStar key={i} className="text-amber-400" />);
        else if (i === fullStars && hasHalf) stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
        else stars.push(<FaRegStar key={i} className="text-amber-400" />);
    }
    return stars;
};

/**
 * ReviewList Component
 * Complete reviews section with stats, list, and form
 */
const ReviewList = ({
    reviews,
    reviewStats,
    isLoggedin,
    canReview,
    newRating,
    setNewRating,
    reviewTitle,
    setReviewTitle,
    newComment,
    setNewComment,
    isSubmitting,
    onSubmit,
}) => {
    return (
        <div>
            {/* Stats */}
            {reviewStats && (
                <div className="flex flex-col lg:flex-row gap-8 mb-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                    <div className="text-center lg:text-left lg:pr-8 lg:border-r border-indigo-200">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{reviewStats.avgRating}</div>
                        <div className="flex justify-center lg:justify-start gap-1 mb-2">
                            {renderStars(reviewStats.avgRating)}
                        </div>
                        <p className="text-gray-500">Based on {reviewStats.totalReviews} reviews</p>
                        {reviewStats.verifiedPurchases > 0 && (
                            <p className="text-green-600 text-sm mt-2 flex items-center justify-center lg:justify-start gap-1">
                                <MdVerified /> {reviewStats.verifiedPurchases} Verified Purchases
                            </p>
                        )}
                    </div>
                    <div className="flex-1 space-y-3">
                        {[5, 4, 3, 2, 1].map((r) => (
                            <RatingBar
                                key={r}
                                rating={r}
                                count={reviewStats.ratingBreakdown?.[r] || 0}
                                total={reviewStats.totalReviews}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Review List */}
            <div className="space-y-6 mb-10">
                {reviews.length > 0 ? reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                )) : (
                    <div className="text-center py-12">
                        <FaQuoteLeft className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No reviews yet</p>
                        <p className="text-gray-400">Be the first to review this product!</p>
                    </div>
                )}
            </div>

            {/* Write Review */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <HiStar className="text-amber-500" />
                    Write a Review
                </h3>

                {!isLoggedin ? (
                    <div className="text-center py-8">
                        <HiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Please login to write a review</p>
                        <Link to="/Login" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition">
                            Login to Review
                        </Link>
                    </div>
                ) : !canReview.canReview ? (
                    <div className="text-center py-8">
                        <MdVerified className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-600">{canReview.reason}</p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-6">
                        {canReview.isVerifiedPurchase && (
                            <div className="flex items-center gap-2 p-4 bg-green-100 text-green-700 rounded-xl">
                                <MdVerified className="w-5 h-5" />
                                <span className="font-medium">Your review will be marked as Verified Purchase!</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2" id="rating-label">Your Rating</label>
                            <Rating
                                size="large"
                                value={newRating}
                                onChange={(e, value) => setNewRating(value)}
                                sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }}
                                aria-labelledby="rating-label"
                            />
                        </div>

                        <TextField
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            label="Review Title"
                            placeholder="Summarize your experience"
                            fullWidth
                            variant="outlined"
                        />

                        <TextField
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            label="Your Review"
                            placeholder="What did you like or dislike?"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReviewList;
