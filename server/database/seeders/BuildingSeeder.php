<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BuildingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('buildings')->insert([
            'height' => 20,
            'floorsCount' => 4,
            'corners' => '[
              {
                "lat": 59.93382558684954,
                "lng": 30.301171754616796
              },
              {
                "lat": 59.933563075929264,
                "lng": 30.301456420245263
              },
              {
                "lat": 59.93385635328524,
                "lng": 30.302477442978386
              },
              {
                "lat": 59.933809713548214,
                "lng": 30.302492897226465
              },
              {
                "lat": 59.933889205696104,
                "lng": 30.30275858711196
              },
              {
                "lat": 59.933934133765455,
                "lng": 30.30273900929519
              },
              {
                "lat": 59.93419240882603,
                "lng": 30.303617633860373
              },
              {
                "lat": 59.93444092454682,
                "lng": 30.303328139957845
              }
            ]',
            'position' => '{
              "lat": 59.93382558684954,
              "lng": 30.301171754616796
            }'
        ]);

        DB::table('interiors')->insert([
            'floors' => '[
              {
                "number": 0,
                "height": 0.7,
                "border": [
                  [0, 0],
                  [0, 2],
                  [3, 2],
                  [3, 0]
                ],
                "walls": [
                  {
                    "start": [1, 0],
                    "end": [1, 2],
                    "windows": [
                      {
                        "left": 1.4,
                        "base": 0,
                        "width": 0.3,
                        "height": 0.4
                      },
                      {
                        "left": 0.4,
                        "base": 0,
                        "width": 0.3,
                        "height": 0.4
                      }
                    ]
                  },
                  {
                    "start": [1, 1],
                    "end": [3, 1],
                    "windows": [
                      {
                        "left": 0.5,
                        "base": 0.1,
                        "width": 1,
                        "height": 0.3
                      }
                    ]
                  }
                ]
              },
              {
                "number": 1,
                "height": 0.7,
                "border": [
                  [0, 0],
                  [0, 2],
                  [3, 2],
                  [3, 0]
                ],
                "walls": [
                  {
                    "start": [0, 1],
                    "end": [3, 1],
                    "windows": [
                      {
                        "left": 1.1,
                        "base": 0,
                        "width": 0.4,
                        "height": 0.4
                      }
                    ]
                  }
                ]
              }
            ]'
        ]);

        DB::table('building_interior')->insert([
            'building_id' => 1,
            'interior_id' => 1
        ]);
    }
}
