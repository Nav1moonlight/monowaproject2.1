<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreB3TransactionRequest;
use App\Http\Requests\UpdateB3TransactionRequest;
use App\Http\Resources\B3TransactionResource;
use App\Models\B3Transaction;
use App\Services\B3TransactionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class B3TransactionController
{
    public function __construct(protected B3TransactionService $service) {}

    /**
     * Get all B3 transactions (paginated with filters)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'type' => 'nullable|in:IN,OUT',
            'status' => 'nullable|string|max:50',
            'search' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $perPage = $validated['per_page'] ?? 25;
        $type = $validated['type'] ?? null;
        $status = $validated['status'] ?? null;
        $search = $validated['search'] ?? null;
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        $query = B3Transaction::with(['wasteCategory', 'creator', 'updater']);

        // Filter by transaction type
        if ($type) {
            $query->where('transaction_type', $type);
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Search by keyword
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('waste_code', 'like', "%{$search}%")
                  ->orWhere('waste_name', 'like', "%{$search}%")
                  ->orWhere('source', 'like', "%{$search}%")
                  ->orWhere('destination', 'like', "%{$search}%")
                  ->orWhere('transporter', 'like', "%{$search}%")
                  ->orWhere('manifest_number', 'like', "%{$search}%")
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

        return B3TransactionResource::collection($transactions);
    }

    /**
     * Create a new B3 transaction
     */
    public function store(StoreB3TransactionRequest $request): B3TransactionResource
    {
        $transaction = $this->service->createTransaction($request->validated());

        return new B3TransactionResource($transaction->load(['wasteCategory', 'creator', 'updater']));
    }

    /**
     * Get single B3 transaction
     */
    public function show(B3Transaction $b3Transaction): B3TransactionResource
    {
        $transaction = $this->service->getTransaction($b3Transaction->id);

        return new B3TransactionResource($transaction->loadMissing(['wasteCategory', 'creator', 'updater']));
    }

    /**
     * Update a B3 transaction
     */
    public function update(UpdateB3TransactionRequest $request, B3Transaction $b3Transaction): B3TransactionResource
    {
        $transaction = $this->service->updateTransaction($b3Transaction, $request->validated());

        return new B3TransactionResource($transaction->load(['wasteCategory', 'creator', 'updater']));
    }

    /**
     * Delete a B3 transaction
     */
    public function destroy(B3Transaction $b3Transaction): Response
    {
        $this->service->deleteTransaction($b3Transaction);

        return response()->noContent();
    }
}
