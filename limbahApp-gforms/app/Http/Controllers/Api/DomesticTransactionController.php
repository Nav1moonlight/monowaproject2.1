<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreDomesticTransactionRequest;
use App\Http\Requests\UpdateDomesticTransactionRequest;
use App\Http\Resources\DomesticTransactionResource;
use App\Models\DomesticTransaction;
use App\Services\DomesticTransactionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class DomesticTransactionController
{
    public function __construct(protected DomesticTransactionService $service) {}

    /**
     * Get all domestic transactions (paginated with filters)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'movement_type' => 'nullable|in:IN,OUT',
            'session' => 'nullable|in:MORNING,AFTERNOON',
            'status' => 'nullable|string|max:50',
            'search' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $perPage = $validated['per_page'] ?? 25;
        $movementType = $validated['movement_type'] ?? null;
        $session = $validated['session'] ?? null;
        $status = $validated['status'] ?? null;
        $search = $validated['search'] ?? null;
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        $query = DomesticTransaction::with(['creator', 'updater']);

        // Filter by movement type
        if ($movementType) {
            $query->where('movement_type', $movementType);
        }

        // Filter by session
        if ($session) {
            $query->where('session', $session);
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Search by keyword
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('pic_name', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhere('processing_method', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($dateFrom) {
            $query->where('date', '>=', Carbon::parse($dateFrom)->startOfDay());
        }

        if ($dateTo) {
            $query->where('date', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        $transactions = $query->orderBy('date', 'desc')->paginate($perPage);

        return DomesticTransactionResource::collection($transactions);
    }

    /**
     * Create a new domestic transaction
     */
    public function store(StoreDomesticTransactionRequest $request): DomesticTransactionResource
    {
        $transaction = $this->service->createTransaction($request->validated());

        return new DomesticTransactionResource($transaction->load(['creator', 'updater']));
    }

    /**
     * Get single domestic transaction
     */
    public function show(DomesticTransaction $domesticTransaction): DomesticTransactionResource
    {
        $transaction = $this->service->getTransaction($domesticTransaction->id);

        return new DomesticTransactionResource($transaction->loadMissing(['creator', 'updater']));
    }

    /**
     * Update a domestic transaction
     */
    public function update(UpdateDomesticTransactionRequest $request, DomesticTransaction $domesticTransaction): DomesticTransactionResource
    {
        $transaction = $this->service->updateTransaction($domesticTransaction, $request->validated());

        return new DomesticTransactionResource($transaction->load(['creator', 'updater']));
    }

    /**
     * Delete a domestic transaction
     */
    public function destroy(DomesticTransaction $domesticTransaction): Response
    {
        $this->service->deleteTransaction($domesticTransaction);

        return response()->noContent();
    }
}
