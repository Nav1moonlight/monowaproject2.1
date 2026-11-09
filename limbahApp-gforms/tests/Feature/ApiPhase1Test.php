<?php

namespace Tests\Feature;

use App\Models\B3Transaction;
use App\Models\DomesticTransaction;
use App\Models\User;
use App\Models\WasteCategory;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ApiPhase1Test extends TestCase
{
    use RefreshDatabase;

    protected $seed = true;

    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->admin()->create();
        Sanctum::actingAs($user);
    }
    /**
     * Test waste categories endpoint
     */
    public function test_get_waste_categories()
    {
        $response = $this->getJson('/api/waste-categories');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'code', 'name', 'waste_type']
            ]
        ]);
    }

    /**
     * Test B3 transactions index
     */
    public function test_get_b3_transactions()
    {
        $response = $this->getJson('/api/b3-transactions');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id', 'transaction_type', 'waste_code', 'waste_name',
                    'date', 'weight_kg', 'status'
                ]
            ]
        ]);
    }

    /**
     * Test B3 transactions filter by type
     */
    public function test_get_b3_transactions_filter_by_type()
    {
        $response = $this->getJson('/api/b3-transactions?type=IN');

        $response->assertStatus(200);

        // All returned transactions should be type IN
        foreach ($response->json('data') as $transaction) {
            $this->assertEquals('IN', $transaction['transaction_type']);
        }
    }

    /**
     * Test create B3 transaction
     */
    public function test_create_b3_transaction()
    {
        $category = WasteCategory::first();

        $payload = [
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => today()->toDateString(),
            'source' => 'Test Source',
            'weight_kg' => 100.50,
            'storage_deadline_at' => today()->addDays(90)->toDateString(),
            'status' => 'PENDING',
        ];

        $response = $this->postJson('/api/b3-transactions', $payload);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => ['id', 'transaction_type', 'waste_code', 'date', 'weight_kg']
        ]);
    }

    /**
     * Test create B3 transaction with scale photo
     */
    public function test_create_b3_transaction_with_scale_photo()
    {
        Storage::fake('public');
        $category = WasteCategory::first();
        $file = UploadedFile::fake()->create('scale.jpg', 100, 'image/jpeg');

        $payload = [
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => today()->toDateString(),
            'source' => 'Test Source Photo',
            'weight_kg' => 120.00,
            'storage_deadline_at' => today()->addDays(90)->toDateString(),
            'status' => 'PENDING',
            'scale_photo' => $file,
        ];

        $response = $this->postJson('/api/b3-transactions', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.weight_kg', 120);
        $this->assertNotNull($response->json('data.scale_photo_url'));
    }

    /**
     * Test get single B3 transaction
     */
    public function test_get_single_b3_transaction()
    {
        $transaction = B3Transaction::first();

        $response = $this->getJson("/api/b3-transactions/{$transaction->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $transaction->id);
    }

    /**
     * Test update B3 transaction
     */
    public function test_update_b3_transaction()
    {
        $transaction = B3Transaction::first();

        $payload = ['status' => 'COMPLETED'];

        $response = $this->putJson("/api/b3-transactions/{$transaction->id}", $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'COMPLETED');
    }

    /**
     * Test delete B3 transaction
     */
    public function test_delete_b3_transaction()
    {
        $transaction = B3Transaction::first();
        $transactionId = $transaction->id;

        $response = $this->deleteJson("/api/b3-transactions/{$transactionId}");

        $response->assertStatus(204);
    }

    /**
     * Test domestic transactions index
     */
    public function test_get_domestic_transactions()
    {
        $response = $this->getJson('/api/domestic-transactions');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'date', 'session', 'total_weight_kg', 'status']
            ]
        ]);
    }

    /**
     * Test create domestic transaction
     */
    public function test_create_domestic_transaction()
    {
        $payload = [
            'date' => now()->subDays(200)->toDateString(),
            'movement_type' => 'IN',
            'session' => 'MORNING',
            'domestic_residue_kg' => 125.0,
            'organic_weight_kg' => 50.0,
            'inorganic_weight_kg' => 75.0,
            'status' => 'SUBMITTED',
            'pic_name' => 'Test PIC',
        ];

        $response = $this->postJson('/api/domestic-transactions', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.total_weight_kg', 125);
    }

    /**
     * Test dashboard summary endpoint
     */
    public function test_get_dashboard_summary()
    {
        $response = $this->getJson('/api/dashboard/summary');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'b3_total_weight_kg',
                'b3_count_in',
                'b3_count_out',
                'domestic_today_organic_kg',
                'domestic_today_inorganic_kg',
                'storage_alerts_active',
                'notifications_unread',
                'recent_b3_transactions',
                'recent_domestic_transactions',
                'recent_alerts',
            ]
        ]);
    }

    /**
     * Test dashboard alerts endpoint
     */
    public function test_get_dashboard_alerts()
    {
        $response = $this->getJson('/api/dashboard/alerts');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'alert_type', 'deadline_at', 'is_active']
            ]
        ]);
    }

    /**
     * Test health check endpoint
     */
    public function test_dashboard_health()
    {
        $response = $this->getJson('/api/dashboard/health');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status', 'expired_alerts', 'near_deadline_count', 'last_checked'
        ]);
    }

    /**
     * Test notifications endpoint
     */
    public function test_get_notifications()
    {
        $response = $this->getJson('/api/notifications');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'type', 'title', 'message', 'is_read']
            ]
        ]);
    }

    /**
     * Test health check endpoint
     */
    public function test_health_check()
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200);
        $response->assertJsonStructure(['status', 'timestamp']);
    }

    /**
     * Test invalid route returns 404
     */
    public function test_invalid_route_returns_404()
    {
        $response = $this->getJson('/api/invalid-endpoint');

        $response->assertStatus(404);
    }

    /**
     * Test dashboard caching and automatic invalidation on new transactions
     */
    public function test_dashboard_caching_and_cache_invalidation()
    {
        // 1. Initial dashboard summary request caches the result
        $firstResponse = $this->getJson('/api/dashboard/summary');
        $firstResponse->assertStatus(200);
        $initialInWeight = $firstResponse->json('data.b3_in_weight_kg');

        // 2. Create a new B3 transaction (triggers DashboardService::clearCache())
        $category = WasteCategory::first();
        $this->postJson('/api/b3-transactions', [
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => now()->toDateString(),
            'storage_deadline_at' => now()->addDays(90)->toDateString(),
            'source' => 'Lab Pengujian',
            'weight_kg' => 250.0,
            'status' => 'PENDING',
        ])->assertStatus(201);

        // 3. Second dashboard summary request should immediately reflect the updated total
        $secondResponse = $this->getJson('/api/dashboard/summary');
        $secondResponse->assertStatus(200);
        $updatedInWeight = $secondResponse->json('data.b3_in_weight_kg');

        $this->assertEquals((float) $initialInWeight + 250.0, (float) $updatedInWeight);
    }

    /**
     * Test dashboard yearly trends endpoint
     */
    public function test_get_dashboard_yearly_trends()
    {
        $response = $this->getJson('/api/dashboard/yearly-trends?years=5');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'years',
            'trends' => [
                '*' => [
                    'name',
                    'year',
                    'b3in',
                    'b3out',
                    'b3_in_weight_kg',
                    'b3_out_weight_kg',
                    'b3_weight_kg',
                    'morning',
                    'afternoon',
                    'organic',
                    'inorganic',
                    'domestic_organic_kg',
                    'domestic_inorganic_kg',
                    'domestic_weight_kg',
                ]
            ]
        ]);
    }

    /**
     * Test B3 transaction manifest number uniqueness allows reuse when soft-deleted
     */
    public function test_b3_transaction_manifest_unique_allows_soft_deleted_reuse()
    {
        $category = WasteCategory::first();

        // 1. Create first OUT transaction with manifest MAN-TEST-123
        $first = $this->postJson('/api/b3-transactions', [
            'transaction_type' => 'OUT',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => now()->toDateString(),
            'destination' => 'PT Pengolah B3',
            'transporter' => 'PT Transporter B3',
            'manifest_number' => 'MAN-TEST-123',
            'weight_kg' => 100.0,
            'remaining_weight_kg' => 0.0,
            'status' => 'COMPLETED',
        ]);
        $first->assertStatus(201);
        $txId = $first->json('data.id');

        // 2. Attempt duplicate should fail with 422
        $duplicate = $this->postJson('/api/b3-transactions', [
            'transaction_type' => 'OUT',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => now()->toDateString(),
            'destination' => 'PT Pengolah B3',
            'transporter' => 'PT Transporter B3',
            'manifest_number' => 'MAN-TEST-123',
            'weight_kg' => 50.0,
            'remaining_weight_kg' => 0.0,
            'status' => 'COMPLETED',
        ]);
        $duplicate->assertStatus(422);

        // 3. Soft-delete the first transaction
        $this->deleteJson("/api/b3-transactions/{$txId}")->assertStatus(204);

        // 4. Now the same manifest number should be allowed to be reused
        $reused = $this->postJson('/api/b3-transactions', [
            'transaction_type' => 'OUT',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => now()->toDateString(),
            'destination' => 'PT Pengolah B3',
            'transporter' => 'PT Transporter B3',
            'manifest_number' => 'MAN-TEST-123',
            'weight_kg' => 50.0,
            'remaining_weight_kg' => 0.0,
            'status' => 'COMPLETED',
        ]);
        $reused->assertStatus(201);
    }

    /**
     * Test B3 transaction server-side pagination
     */
    public function test_b3_transactions_server_side_pagination()
    {
        $response = $this->getJson('/api/b3-transactions?page=1&per_page=5');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'links',
            'meta' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]
        ]);
        $this->assertLessThanOrEqual(5, count($response->json('data')));
    }

    /**
     * Test Domestic transaction server-side pagination
     */
    public function test_domestic_transactions_server_side_pagination()
    {
        $response = $this->getJson('/api/domestic-transactions?page=1&per_page=5');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'links',
            'meta' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]
        ]);
        $this->assertLessThanOrEqual(5, count($response->json('data')));
    }
}
