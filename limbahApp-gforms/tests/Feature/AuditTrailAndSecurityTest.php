<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\B3Transaction;
use App\Models\DomesticTransaction;
use App\Models\User;
use App\Models\WasteCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuditTrailAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected $seed = true;

    /**
     * Test B3 transaction audit trail tracking (created_by & updated_by)
     */
    public function test_b3_transaction_audit_trail_created_by_and_updated_by(): void
    {
        $operator = User::factory()->create([
            'name' => 'Operator Lapangan',
            'email' => 'operator.audit@monowa.test',
            'role' => UserRole::OPERATOR_TPS,
        ]);

        $admin = User::factory()->create([
            'name' => 'Admin EHS',
            'email' => 'admin.audit@monowa.test',
            'role' => UserRole::ADMIN_EHS,
        ]);

        // 1. Operator creates B3 transaction
        Sanctum::actingAs($operator);
        $category = WasteCategory::first() ?? WasteCategory::factory()->create();

        $createResponse = $this->postJson('/api/b3-transactions', [
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => now()->toDateString(),
            'storage_deadline_at' => now()->addDays(90)->toDateString(),
            'source' => 'Bengkel Utama',
            'weight_kg' => 120.0,
            'status' => 'PENDING',
        ]);

        $createResponse->assertStatus(201);
        $txId = $createResponse->json('data.id');

        $this->assertDatabaseHas('b3_transactions', [
            'id' => $txId,
            'created_by' => $operator->id,
            'updated_by' => null,
        ]);

        // 2. Admin updates the B3 transaction
        Sanctum::actingAs($admin);

        $updateResponse = $this->putJson("/api/b3-transactions/{$txId}", [
            'status' => 'RECEIVED',
            'notes' => 'Telah diverifikasi oleh Admin EHS',
        ]);

        $updateResponse->assertStatus(200);

        $this->assertDatabaseHas('b3_transactions', [
            'id' => $txId,
            'created_by' => $operator->id,
            'updated_by' => $admin->id,
        ]);

        // 3. Verify creator and updater details in GET show endpoint
        $showResponse = $this->getJson("/api/b3-transactions/{$txId}");
        $showResponse->assertStatus(200);
        $showResponse->assertJsonPath('data.creator.name', 'Operator Lapangan');
        $showResponse->assertJsonPath('data.updater.name', 'Admin EHS');
    }

    /**
     * Test Domestic transaction audit trail tracking (created_by & updated_by)
     */
    public function test_domestic_transaction_audit_trail_created_by_and_updated_by(): void
    {
        $operator = User::factory()->create([
            'name' => 'Operator Domestik',
            'email' => 'operator.dom@monowa.test',
            'role' => UserRole::OPERATOR_TPS,
        ]);

        $admin = User::factory()->create([
            'name' => 'Supervisor EHS',
            'email' => 'admin.dom@monowa.test',
            'role' => UserRole::ADMIN_EHS,
        ]);

        // 1. Operator creates Domestic transaction
        Sanctum::actingAs($operator);

        $createResponse = $this->postJson('/api/domestic-transactions', [
            'date' => now()->subDays(150)->toDateString(),
            'movement_type' => 'IN',
            'session' => 'MORNING',
            'domestic_residue_kg' => 45.0,
            'organic_weight_kg' => 30.0,
            'inorganic_weight_kg' => 15.0,
            'status' => 'SUBMITTED',
            'pic_name' => 'Petugas Pagi',
        ]);

        $createResponse->assertStatus(201);
        $txId = $createResponse->json('data.id');

        $this->assertDatabaseHas('domestic_transactions', [
            'id' => $txId,
            'created_by' => $operator->id,
            'updated_by' => null,
        ]);

        // 2. Admin updates the Domestic transaction
        Sanctum::actingAs($admin);

        $updateResponse = $this->putJson("/api/domestic-transactions/{$txId}", [
            'status' => 'VERIFIED',
            'notes' => 'Disetujui EHS',
        ]);

        $updateResponse->assertStatus(200);

        $this->assertDatabaseHas('domestic_transactions', [
            'id' => $txId,
            'created_by' => $operator->id,
            'updated_by' => $admin->id,
        ]);

        // 3. Verify creator and updater details in GET show endpoint
        $showResponse = $this->getJson("/api/domestic-transactions/{$txId}");
        $showResponse->assertStatus(200);
        $showResponse->assertJsonPath('data.creator.name', 'Operator Domestik');
        $showResponse->assertJsonPath('data.updater.name', 'Supervisor EHS');
    }

    /**
     * Test unauthenticated API requests return 401 Unauthorized
     */
    public function test_unauthenticated_api_requests_return_401(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
        $this->getJson('/api/b3-transactions')->assertStatus(401);
        $this->getJson('/api/domestic-transactions')->assertStatus(401);
        $this->getJson('/api/dashboard/summary')->assertStatus(401);
        $this->getJson('/api/waste-sources')->assertStatus(401);
    }

    /**
     * Test scale photo upload and cleanup when replaced
     */
    public function test_scale_photo_upload_and_cleanup_on_update(): void
    {
        Storage::fake('public');

        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR_TPS,
        ]);
        Sanctum::actingAs($operator);
        $category = WasteCategory::first() ?? WasteCategory::factory()->create();

        $photo1 = UploadedFile::fake()->create('scale1.jpg', 100, 'image/jpeg');

        $createResponse = $this->postJson('/api/b3-transactions', [
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => now()->toDateString(),
            'storage_deadline_at' => now()->addDays(90)->toDateString(),
            'source' => 'Area Produksi',
            'weight_kg' => 70.0,
            'status' => 'PENDING',
            'scale_photo' => $photo1,
        ]);

        $createResponse->assertStatus(201);
        $txId = $createResponse->json('data.id');
        $tx = B3Transaction::find($txId);

        $this->assertNotNull($tx->scale_photo_path);
        Storage::disk('public')->assertExists($tx->scale_photo_path);
        $oldPath = $tx->scale_photo_path;

        // Replace with scale2.jpg
        $photo2 = UploadedFile::fake()->create('scale2.jpg', 100, 'image/jpeg');
        $updateResponse = $this->putJson("/api/b3-transactions/{$txId}", [
            'scale_photo' => $photo2,
        ]);

        $updateResponse->assertStatus(200);
        $tx->refresh();

        $this->assertNotEquals($oldPath, $tx->scale_photo_path);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($tx->scale_photo_path);
    }
}
