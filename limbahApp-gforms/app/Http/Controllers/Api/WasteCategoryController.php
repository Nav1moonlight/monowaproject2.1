<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\WasteCategoryResource;
use App\Models\WasteCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WasteCategoryController
{
    /**
     * Get all waste categories (paginated)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = WasteCategory::query();

        // Optional filter by waste_type
        if ($request->has('waste_type')) {
            $query->where('waste_type', $request->input('waste_type'));
        }

        $perPage = $request->input('per_page', 100);
        $categories = $query->orderBy('name', 'asc')->paginate($perPage);

        return WasteCategoryResource::collection($categories);
    }

    /**
     * Get single waste category
     */
    public function show(WasteCategory $wasteCategory): WasteCategoryResource
    {
        return new WasteCategoryResource($wasteCategory);
    }
}
