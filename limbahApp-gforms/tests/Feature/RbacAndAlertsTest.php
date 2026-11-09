<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\B3Transaction;
use App\Models\DomesticTransaction;
use App\Models\StorageAlert;
use App\Models\User;
use App\Models\WasteCategory;
use App\Models\WasteSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RbacAndAlertsTest extends TestCase
{
    use RefreshDatabase;

    protected $seed = true;

    /**
     * Test registration always defaults to OPERATOR_TPS and ignores role escalation
     */
    public function test_user_registration_with_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Operator',
            'email' => 'operator@monowa.test',
            'password' => 'password123',
            'role' => 'ADMIN_EHS', // Attempted privilege escalation
            'department' => 'TPS Area 1',
            'phone' => '081234567890',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('user.role', 'OPERATOR_TPS');
        $response->assertJsonPath('user.department', 'TPS Area 1');
    }

    /**
     * Test admin can delete B3 transactions
     */
    public function test_admin_can_delete_b3_transaction(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN_EHS,
        ]);
        Sanctum::actingAs($admin);

        $category = WasteCategory::first() ?? WasteCategory::factory()->create();
        $tx = B3Transaction::create([
            'date' => now()->toDateString(),
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => 'B101',
            'waste_name' => 'Oli Bekas',
            'weight_kg' => 150.5,
            'status' => 'PENDING',
        ]);

        $response = $this->deleteJson("/api/b3-transactions/{$tx->id}");
        $response->assertStatus(204);

        $this->assertSoftDeleted('b3_transactions', ['id' => $tx->id]);
    }

    /**
     * Test operator cannot delete B3 transactions (403 Forbidden)
     */
    public function test_operator_cannot_delete_b3_transaction(): void
    {
        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR_TPS,
        ]);
        Sanctum::actingAs($operator);

        $category = WasteCategory::first() ?? WasteCategory::factory()->create();
        $tx = B3Transaction::create([
            'date' => now()->toDateString(),
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => 'B101',
            'waste_name' => 'Oli Bekas',
            'weight_kg' => 150.5,
            'status' => 'PENDING',
        ]);

        $response = $this->deleteJson("/api/b3-transactions/{$tx->id}");
        $response->assertStatus(403);

        $this->assertDatabaseHas('b3_transactions', ['id' => $tx->id]);
    }

    /**
     * Test auditor cannot create or update B3 transactions (403 Forbidden)
     */
    public function test_auditor_cannot_create_or_update_b3_transaction(): void
    {
        $auditor = User::factory()->create([
            'role' => UserRole::AUDITOR,
        ]);
        Sanctum::actingAs($auditor);

        $category = WasteCategory::first() ?? WasteCategory::factory()->create();

        // Attempt create
        $createResponse = $this->postJson('/api/b3-transactions', [
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => 'B101',
            'waste_name' => 'Limbah Laboratorium',
            'date' => now()->toDateString(),
            'storage_deadline_at' => now()->addDays(90)->toDateString(),
            'source' => 'QC Lab',
            'weight_kg' => 75.0,
            'status' => 'PENDING',
        ]);
        $createResponse->assertStatus(403);

        // Attempt update
        $tx = B3Transaction::create([
            'date' => now()->toDateString(),
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => 'B101',
            'waste_name' => 'Oli Bekas',
            'weight_kg' => 100,
            'status' => 'PENDING',
        ]);

        $updateResponse = $this->putJson("/api/b3-transactions/{$tx->id}", [
            'status' => 'COMPLETED',
        ]);
        $updateResponse->assertStatus(403);
    }

    /**
     * Test auditor cannot create or update Domestic transactions (403 Forbidden)
     */
    public function test_auditor_cannot_create_or_update_domestic_transaction(): void
    {
        $auditor = User::factory()->create([
            'role' => UserRole::AUDITOR,
        ]);
        Sanctum::actingAs($auditor);

        // Attempt create
        $createResponse = $this->postJson('/api/domestic-transactions', [
            'date' => now()->subDays(50)->toDateString(),
            'movement_type' => 'IN',
            'session' => 'MORNING',
            'domestic_residue_kg' => 50.0,
            'status' => 'SUBMITTED',
            'pic_name' => 'Auditor',
        ]);
        $createResponse->assertStatus(403);

        // Attempt update
        $tx = DomesticTransaction::create([
            'date' => now()->subDays(50)->toDateString(),
            'movement_type' => 'IN',
            'session' => 'MORNING',
            'domestic_residue_kg' => 50.0,
            'status' => 'SUBMITTED',
            'pic_name' => 'Petugas',
        ]);

        $updateResponse = $this->putJson("/api/domestic-transactions/{$tx->id}", [
            'status' => 'VERIFIED',
        ]);
        $updateResponse->assertStatus(403);
    }

    /**
     * Test auditor cannot create or update waste sources (403 Forbidden)
     */
    public function test_auditor_cannot_create_or_update_waste_source(): void
    {
        $auditor = User::factory()->create([
            'role' => UserRole::AUDITOR,
        ]);
        Sanctum::actingAs($auditor);

        $createResponse = $this->postJson('/api/waste-sources', [
            'name' => 'Lokasi Sumber Baru',
            'code' => 'WS-NEW',
            'entity' => 'UT',
        ]);
        $createResponse->assertStatus(403);

        $source = WasteSource::create([
            'name' => 'Workshop Area 1',
            'code' => 'WS-01',
            'entity' => 'UT',
        ]);

        $updateResponse = $this->putJson("/api/waste-sources/{$source->id}", [
            'name' => 'Workshop Area Renamed',
        ]);
        $updateResponse->assertStatus(403);
    }

    /**
     * Test operator can create and update B3 transactions
     */
    public function test_operator_can_create_and_update_b3_transaction(): void
    {
        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR_TPS,
        ]);
        Sanctum::actingAs($operator);

        $category = WasteCategory::first() ?? WasteCategory::factory()->create();

        $createResponse = $this->postJson('/api/b3-transactions', [
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => $category->code,
            'waste_name' => $category->name,
            'date' => now()->toDateString(),
            'storage_deadline_at' => now()->addDays(90)->toDateString(),
            'source' => 'Area Produksi 2',
            'weight_kg' => 88.5,
            'status' => 'PENDING',
        ]);

        $createResponse->assertStatus(201);
        $txId = $createResponse->json('data.id');

        $updateResponse = $this->putJson("/api/b3-transactions/{$txId}", [
            'status' => 'RECEIVED',
            'notes' => 'Telah diterima di TPS B3',
        ]);

        $updateResponse->assertStatus(200);
        $updateResponse->assertJsonPath('data.status', 'RECEIVED');
    }

    /**
     * Test acknowledging storage alert
     */
    public function test_acknowledge_storage_alert(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN_EHS,
        ]);
        Sanctum::actingAs($admin);

        $category = WasteCategory::first() ?? WasteCategory::factory()->create();
        $tx = B3Transaction::create([
            'date' => now()->subDays(10)->toDateString(),
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => 'B101',
            'waste_name' => 'Limbah Medis',
            'weight_kg' => 50,
            'status' => 'PENDING',
            'storage_deadline_at' => now()->addDays(5),
        ]);

        $alert = StorageAlert::create([
            'b3_transaction_id' => $tx->id,
            'alert_type' => 'STORAGE_NEAR_DEADLINE',
            'deadline_at' => $tx->storage_deadline_at,
            'is_active' => true,
        ]);

        $response = $this->postJson("/api/dashboard/alerts/{$alert->id}/acknowledge", [
            'acknowledged_by' => 'Petugas EHS',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('storage_alerts', [
            'id' => $alert->id,
            'is_active' => false,
        ]);
    }

    /**
     * Test artisan command limbah:check-alerts generates H-30, H-7, and EXPIRED alerts successfully
     */
    public function test_check_b3_alerts_artisan_command(): void
    {
        $category = WasteCategory::first() ?? WasteCategory::factory()->create();

        // 1. Transaction near deadline (H-5 -> H-7 alert)
        $txH7 = B3Transaction::create([
            'date' => now()->subDays(85)->toDateString(),
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => 'B101',
            'waste_name' => 'Aki Bekas',
            'weight_kg' => 120,
            'status' => 'PENDING',
            'storage_deadline_at' => now()->addDays(5),
        ]);

        // 2. Transaction expired (Expired 2 days ago)
        $txExpired = B3Transaction::create([
            'date' => now()->subDays(95)->toDateString(),
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => 'B102',
            'waste_name' => 'Solvent Bekas',
            'weight_kg' => 60,
            'status' => 'PENDING',
            'storage_deadline_at' => now()->subDays(2),
        ]);

        // 3. Transaction H-20 (H-30 alert)
        $txH30 = B3Transaction::create([
            'date' => now()->subDays(70)->toDateString(),
            'transaction_type' => 'IN',
            'waste_category_id' => $category->id,
            'waste_code' => 'B103',
            'waste_name' => 'Majun Terkontaminasi',
            'weight_kg' => 45,
            'status' => 'PENDING',
            'storage_deadline_at' => now()->addDays(20),
        ]);

        $exitCode = Artisan::call('limbah:check-alerts');
        $this->assertEquals(0, $exitCode);

        $this->assertDatabaseHas('storage_alerts', [
            'b3_transaction_id' => $txH7->id,
            'alert_type' => 'H-7',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('storage_alerts', [
            'b3_transaction_id' => $txExpired->id,
            'alert_type' => 'EXPIRED',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('storage_alerts', [
            'b3_transaction_id' => $txH30->id,
            'alert_type' => 'H-30',
            'is_active' => true,
        ]);
    }
}
