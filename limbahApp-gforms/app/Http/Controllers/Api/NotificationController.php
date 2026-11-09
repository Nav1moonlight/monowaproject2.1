<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class NotificationController
{
    /**
     * Get all notifications (unread by default)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = $request->input('per_page', 50);
        $includeRead = $request->boolean('include_read', false);

        $query = Notification::query();

        if (!$includeRead) {
            $query->unread();
        }

        if ($request->has('type')) {
            $query->byType($request->input('type'));
        }

        $notifications = $query->recent()->paginate($perPage);

        return NotificationResource::collection($notifications);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification): NotificationResource
    {
        $notification->markAsRead();

        return new NotificationResource($notification);
    }
}
