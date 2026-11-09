<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreWasteSourceRequest;
use App\Http\Requests\UpdateWasteSourceRequest;
use App\Http\Resources\WasteSourceResource;
use App\Models\WasteSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WasteSourceController
{
    /**
     * Get all waste sources
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = WasteSource::query();

        // Optional filter active status (default true unless all=1 or active=0)
        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->input('active'), FILTER_VALIDATE_BOOLEAN));
        } elseif (!$request->boolean('all')) {
            $query->where('is_active', true);
        }

        // Optional filter by entity
        if ($request->filled('entity')) {
            $query->where('entity', $request->input('entity'));
        }

        // Optional search by name/code
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 100);
        $sources = $query->orderBy('entity', 'asc')
            ->orderBy('name', 'asc')
            ->paginate($perPage);

        return WasteSourceResource::collection($sources);
    }

    /**
     * Store a newly created waste source
     */
    public function store(StoreWasteSourceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()?->id;

        // Auto uppercase entity if provided
        if (isset($data['entity'])) {
            $data['entity'] = strtoupper(trim($data['entity']));
        } else {
            // Infer entity from name if contains UTPE vs UT
            if (stripos($data['name'], 'UTPE') !== false) {
                $data['entity'] = 'UTPE';
            } elseif (stripos($data['name'], 'UT') !== false) {
                $data['entity'] = 'UT';
            } else {
                $data['entity'] = 'OTHER';
            }
        }

        $source = WasteSource::create($data);

        return (new WasteSourceResource($source))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified waste source
     */
    public function show(WasteSource $wasteSource): WasteSourceResource
    {
        return new WasteSourceResource($wasteSource);
    }

    /**
     * Update the specified waste source
     */
    public function update(UpdateWasteSourceRequest $request, WasteSource $wasteSource): WasteSourceResource
    {
        $data = $request->validated();
        $data['updated_by'] = $request->user()?->id;

        if (isset($data['entity'])) {
            $data['entity'] = strtoupper(trim($data['entity']));
        }

        $wasteSource->update($data);

        return new WasteSourceResource($wasteSource);
    }

    /**
     * Remove the specified waste source (soft delete)
     */
    public function destroy(WasteSource $wasteSource): JsonResponse
    {
        $wasteSource->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lokasi sumber limbah berhasil dihapus.',
        ]);
    }
}
