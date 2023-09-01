<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BuildingBargain extends Model
{
    use HasFactory;

    protected $guarded = [
        //'price'
    ];

    public function seller(): HasOne
    {
        return $this->hasOne(User::class, 'seller_id');
    }
    public function buyer(): HasOne
    {
        return $this->hasOne(User::class, 'buyer_id');
    }
    public function building(): HasOne
    {
        return $this->hasOne(Building::class, 'building_id');
    }
}
