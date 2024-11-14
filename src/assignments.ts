import { game } from "./game.ts"
import { updateInventoryItem } from "./items/update.ts"

export const getTotalAssignedLand = () => Object.values(game.landAssignedTypes).reduce((l, c) => l + c, 0)

export const landAssign: Record<string, (amount: number) => void> = {
    "basic_den": (amount) => {
        game.comfort += 1 * amount;
    },
    "wooden_den": (amount) => {
        game.comfort += 5 * amount;
    },
    "stone_house": (amount) => {
        game.comfort += 10 * amount;
    },
}
const landUnassign: Record<string, (amount: number) => void> = {
    "basic_den": (amount) => {
        game.comfort -= 1 * amount;
    },
    "wooden_den": (amount) => {
        game.comfort -= 5 * amount;
    },
    "stone_house": (amount) => {
        game.comfort -= 10 * amount;
    },
}

interface AssignmentType {
    name: string,
    id: string
}
const landAssignmentTypes: AssignmentType[] = [
    {
        "name": "Food Stockpiles",
        "id": "food_stockpiles"
    },
    {
        "name": "Research Library",
        "id": "research_library"
    },
    {
        "name": "Grass Den",
        "id": "grass_den"
    },
]
export const createAssignmentType = (assignmentType: AssignmentType, fromItem: boolean) => {
    const assignmentTypeDiv = document.createElement("div");
    const nameAndCount = document.createElement("span")
    nameAndCount.textContent = assignmentType.name + ": "
    const countSpan = document.createElement("span");
    countSpan.textContent = fromItem ? "" : "0"
    if (fromItem) countSpan.classList.add("assignmentItemCount");
    if (fromItem) countSpan.id = "inventory." + assignmentType.id;
    nameAndCount.appendChild(countSpan)
    assignmentTypeDiv.appendChild(nameAndCount);
    const minusButton = document.createElement("button");
    minusButton.textContent = fromItem ? "Demolish" : "-";
    minusButton.classList.add("assignmentItemDemolish");
    minusButton.dataset.id = assignmentType.id;
    minusButton.addEventListener("click", () => {
        if (fromItem) {
            if (game.inventory[assignmentType.id] <= 0) return;
            game.inventory[assignmentType.id] -= 1;
            updateInventoryItem(assignmentType.id);
            landUnassign[assignmentType.id]?.(1);
        } else {
            if (!game.landAssignedTypes[assignmentType.id]) return;
            game.landAssignedTypes[assignmentType.id] -= 1;
            countSpan.textContent = game.landAssignedTypes[assignmentType.id] + "";
            if (game.landAssignedTypes[assignmentType.id] === 0) minusButton.disabled = true;
            document.getElementById("availableLandAssignmentsSpan")!.textContent = "Available land assignments: " + (game.landAssignments - getTotalAssignedLand());
        };
    });
    assignmentTypeDiv.appendChild(minusButton);
    if (!fromItem) {
        const plusButton = document.createElement("button");
        plusButton.textContent = "+";
        plusButton.addEventListener("click", () => {
            if (game.landAssignments - getTotalAssignedLand() <= 0) return;
            game.landAssignedTypes[assignmentType.id] ??= 0;
            game.landAssignedTypes[assignmentType.id] += 1;
            countSpan.textContent = game.landAssignedTypes[assignmentType.id] + "";
            minusButton.disabled = false;
            document.getElementById("availableLandAssignmentsSpan")!.textContent = "Available land assignments: " + (game.landAssignments - getTotalAssignedLand());    
        })
        assignmentTypeDiv.appendChild(plusButton);
    }
    document.getElementById("landAssignmentsList")!.appendChild(assignmentTypeDiv);
}
for (const assignmentType of landAssignmentTypes) {
    createAssignmentType(assignmentType, false);
}
