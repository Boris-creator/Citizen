<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Building extends Model
{
    use HasFactory;

    protected $fillable = [
        'position',
        'corners',
        'height',
        'floorsCount',
        'name',
        'user_id'
    ];
    protected $casts = [
        'corners' => 'array',
        'position' => 'array',
        'height' => 'integer',
        'floorsCount' => 'integer',
    ];

    public function interiors(): BelongsToMany
    {
        return $this->belongsToMany(Interior::class);
    }

    public function owner() : HasOne
    {
        return $this->hasOne(User::class, 'user_id');
    }
}
