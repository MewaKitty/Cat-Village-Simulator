import type { Cat } from "./cats.ts"

export const game: {
    catDollars: number,
    researchPoints: number,
    comfort: number,
    inventory: Record<string, number>,
    landAssignments: number,
    landSize: number,
    raid: boolean,
    starvationPoints: number,
    foodStock: number[],
    landAssignedTypes: Record<string, number>,
    researched: Record<string, boolean>,
    cats: Cat[],
    recruitmentCooldown: number
} = {
    catDollars: 0,
    researchPoints: 0,
    comfort: 0,
    inventory: {},
    landAssignments: 0,
    landSize: 1,
    raid: false,
    starvationPoints: 0,
    foodStock: [],
    landAssignedTypes: {},
    researched: {},
    cats: [],
    recruitmentCooldown: 60
}

game.inventory.wood = 100000000;
game.inventory.wooden_plank = 100000000;
game.inventory.stone = 100000000;