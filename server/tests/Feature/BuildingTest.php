<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class BuildingTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $user = User::query()->find(1);
        $buildings = Building::all();
        $response = $this->actingAs($user)
            ->withHeaders([
                'Accept' => 'application/json',
                'Access-Control-Allow-Credentials' => 'true'
            ])
            ->withCredentials()
            ->post('/api/buildings');

        $response->assertStatus(200)->assertJson($buildings->toArray());
    }
}
