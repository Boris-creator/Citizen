<?php

namespace App\Services;

use App\Models\Building;
use App\Models\BuildingBargain;
use App\Models\User;

class BuildingBargainService {
    public static function getMarketPrice(float $area): float
    {
        return $area * config('constants.SQUARE_METER_PRICE');
    }

    public static function makeLandBargain(Building $building, float $price, $participants = array()): void
    {
        $buyer = $participants['buyer'];
        if (!self::checkUserBalance($price, $buyer)) {
            return;
        }
        $buyer->balance -= $price;
        $buyer->save();

        BuildingBargain::query()->create([
            'building_id' => $building->id,
            'buyer_id' => $buyer->id,
            'price' => $price
        ]);
    }

    public static function checkUserBalance (float $price, User $user): bool
    {
        return $price <= $user->balance;
    }
}
