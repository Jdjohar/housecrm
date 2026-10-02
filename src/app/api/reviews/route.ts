import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import Setting from '@/models/Setting';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();

    const reviews = await Review.find().sort({ requestedAt: -1 }).lean();

    const totalRequested = reviews.length;
    const completedReviews = reviews.filter((r) => r.rating !== undefined && r.rating !== null);
    const totalReceived = completedReviews.length;
    const fiveStarCount = completedReviews.filter((r) => r.rating === 5).length;
    const privateFeedbackCount = completedReviews.filter((r) => r.rating && r.rating < 5).length;

    const avgRating =
      totalReceived > 0
        ? Number(
            (
              completedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReceived
            ).toFixed(1)
          )
        : 5.0;

    const statusBreakdown = {
      new: reviews.filter((r) => r.responseStatus === 'new').length,
      reviewed: reviews.filter((r) => r.responseStatus === 'reviewed').length,
      contacted_client: reviews.filter((r) => r.responseStatus === 'contacted_client').length,
      resolved: reviews.filter((r) => r.responseStatus === 'resolved').length,
    };

    const setting = await Setting.findOne().lean();
    const googleReviewUrl =
      setting?.googleReviewUrl ||
      process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
      'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4';

    return NextResponse.json({
      success: true,
      stats: {
        totalRequested,
        totalReceived,
        avgRating,
        fiveStarCount,
        privateFeedbackCount,
        responseRatePercent:
          totalRequested > 0 ? Math.round((totalReceived / totalRequested) * 100) : 0,
        googleConversionPercent:
          totalReceived > 0 ? Math.round((fiveStarCount / totalReceived) * 100) : 0,
        statusBreakdown,
      },
      googleReviewUrl,
      reviews,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Handles customer submitting feedback from public /review/[id] page
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { customerId, reviewId, rating, feedbackText, experienceTags } = body;

    const setting = await Setting.findOne().lean();
    const googleReviewUrl =
      setting?.googleReviewUrl ||
      process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
      'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4';

    const isFiveStar = Number(rating) === 5;
    const actionTaken = isFiveStar ? 'google_redirect' : 'private_feedback';

    let reviewDoc;
    if (reviewId && mongoose.Types.ObjectId.isValid(reviewId)) {
      reviewDoc = await Review.findById(reviewId);
    } else if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      reviewDoc = await Review.findOne({ customerId }).sort({ requestedAt: -1 });
    }

    if (reviewDoc) {
      reviewDoc.rating = Number(rating);
      reviewDoc.isFiveStar = isFiveStar;
      reviewDoc.actionTaken = actionTaken;
      reviewDoc.feedbackText = feedbackText || reviewDoc.feedbackText;
      if (experienceTags) reviewDoc.customerExperienceTags = experienceTags;
      reviewDoc.submittedAt = new Date();
      reviewDoc.responseStatus = isFiveStar ? 'reviewed' : 'new';
      await reviewDoc.save();
    } else {
      // Create new review record
      let customerName = 'H&H Customer';
      let customerPhone = '';
      let customerEmail = '';

      if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
        const cust = await Customer.findById(customerId);
        if (cust) {
          customerName = cust.name;
          customerPhone = cust.phone;
          customerEmail = cust.email;
        }
      }

      reviewDoc = await Review.create({
        customerId: customerId && mongoose.Types.ObjectId.isValid(customerId) ? customerId : new mongoose.Types.ObjectId(),
        customerName,
        customerPhone,
        customerEmail,
        rating: Number(rating),
        isFiveStar,
        actionTaken,
        feedbackText: feedbackText || '',
        customerExperienceTags: experienceTags || [],
        responseStatus: isFiveStar ? 'reviewed' : 'new',
        submittedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: reviewDoc,
      isFiveStar,
      redirectToGoogle: isFiveStar,
      googleReviewUrl,
      message: isFiveStar
        ? '5 Stars selected! Forwarding to Google Reviews.'
        : 'Private feedback received. H&H management alerted.',
    });
  } catch (error: any) {
    console.error('Review submit error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, responseStatus, internalNotes } = body;

    const updated = await Review.findByIdAndUpdate(
      id,
      {
        ...(responseStatus && { responseStatus }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
