// src/game.ts
var game = {
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
  recruitmentCooldown: 60,
  claimedQuests: []
};
game.inventory.wood = 1e8;
game.inventory.wooden_plank = 1e8;
game.inventory.stone = 1e8;

// src/cats.ts
var catNames = (await (await fetch("./cat_names.txt")).text()).split(`
`);
var randomCatName = () => catNames[Math.floor(Math.random() * catNames.length)];
var abilities = [
  {
    id: "strength",
    name: "Strength"
  },
  {
    id: "intelligence",
    name: "Intelligence"
  },
  {
    id: "agility",
    name: "Agility"
  },
  {
    id: "dexterity",
    name: "Dexterity"
  }
];
var randomCat = () => {
  const cat = {
    id: Math.random() + "",
    name: randomCatName(),
    abilities: {}
  };
  for (const ability of abilities) {
    cat.abilities[ability.id] = Math.floor(Math.random() * 10) + 5;
  }
  return cat;
};
var roles = ["Hunter", "Guard", "Researcher"];
var createCatElement = (cat) => {
  const catElement = document.createElement("li");
  catElement.id = cat.id + ".catBox";
  catElement.classList.add("catBox");
  catElement.innerHTML = `<b>${cat.name}</b>
    ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
    return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find((ability) => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`;
  }).join("")}`;
  document.getElementById("catList")?.appendChild(catElement);
  const roleLabel = document.createElement("label");
  roleLabel.textContent = "Role";
  roleLabel.setAttribute("for", cat.id + ".roleSelect");
  catElement.appendChild(roleLabel);
  const roleSelect = document.createElement("select");
  roleSelect.id = cat.id + ".roleSelect";
  for (const role of roles) {
    const roleOption = document.createElement("option");
    roleOption.textContent = role;
    roleSelect.appendChild(roleOption);
  }
  catElement.appendChild(roleSelect);
  roleSelect.addEventListener("change", () => {
    cat.role = roleSelect.options[roleSelect.selectedIndex].text;
  });
  const skillsList = document.createElement("ul");
  skillsList.classList.add("skillsList");
  catElement.appendChild(skillsList);
};
var createNewRole = (roleName) => {
  roles.push(roleName);
  for (const cat of game.cats) {
    const catElement = document.getElementById(cat.id + ".catBox");
    const roleOption = document.createElement("option");
    roleOption.textContent = roleName;
    catElement.querySelector("select")?.appendChild(roleOption);
  }
};
var skills = [
  {
    id: "treeChopping",
    name: "Tree Chopping"
  },
  {
    id: "mining",
    name: "Mining"
  },
  {
    id: "researching",
    name: "Researching"
  }
];
var recalculateCatSkills = (cat) => {
  const catElement = document.getElementById(cat.id + ".catBox");
  const skillsList = catElement?.getElementsByClassName("skillsList")[0];
  skillsList.textContent = "";
  for (const [id, skill] of Object.entries(cat.skills)) {
    const skillElem = document.createElement("li");
    skillElem.textContent = `${skills.find((skillData) => skillData.id === id)?.name}: Level ${skill.level} (${skill.xp} xp)`;
    skillsList?.appendChild(skillElem);
  }
};

// src/recruitment.ts
var showRecruitmentMenu = () => {
  document.getElementById("toolsNotUnlocked").hidden = true;
  const recruitToolButton = document.createElement("button");
  recruitToolButton.textContent = "Recruit";
  document.getElementById("toolsRow").appendChild(recruitToolButton);
  recruitToolButton.addEventListener("click", () => {
    if (document.getElementById("recruitmentDiv"))
      return;
    const recruitmentDiv = document.createElement("div");
    recruitmentDiv.id = "recruitmentDiv";
    recruitmentDiv.innerHTML = `<b>Recruitment</b>
        <p>You go and put up a poster for recruitment. One of the candidates stand out. Would you like to recruit them?</p>`;
    document.getElementById("informationList").appendChild(recruitmentDiv);
    const closeRecruit = () => {
      recruitmentDiv.remove();
      recruitToolButton.disabled = true;
      let secsPassed = 0;
      const recruitInterval = setInterval(() => {
        secsPassed += 1;
        recruitToolButton.textContent = "Recruit - " + (game.recruitmentCooldown - secsPassed) + "s left";
        if (secsPassed >= game.recruitmentCooldown) {
          recruitToolButton.textContent = "Recruit";
          recruitToolButton.disabled = false;
          clearInterval(recruitInterval);
        }
      }, 1000);
    };
    const closeButton = document.createElement("div");
    closeButton.classList.add("closeButton");
    closeButton.setAttribute("aria-label", "Close");
    closeButton.textContent = "X";
    closeButton.addEventListener("click", () => {
      closeRecruit();
    });
    recruitmentDiv.appendChild(closeButton);
    const catElement = document.createElement("div");
    catElement.classList.add("catBox");
    const cat = randomCat();
    catElement.innerHTML = `<b>${cat.name}</b>
        ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
      return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find((ability) => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`;
    }).join("")}`;
    const recruitButton = document.createElement("button");
    recruitButton.textContent = "Recruit";
    catElement.appendChild(recruitButton);
    recruitButton.addEventListener("click", () => {
      cat.role = "Hunter";
      cat.skills = {};
      createCatElement(cat);
      game.cats.push(cat);
      closeRecruit();
    });
    recruitmentDiv.appendChild(catElement);
  });
};

// src/items/data.ts
var items = [
  {
    id: "wood",
    name: "Wood",
    research: 1,
    sell: 1,
    buy: 2
  },
  {
    id: "water_cup",
    name: "Water Cup",
    research: 1
  },
  {
    id: "basic_den",
    name: "Basic Den",
    research: 2,
    building: true
  },
  {
    id: "wooden_plank",
    name: "Wooden Plank",
    research: 3
  },
  {
    id: "wooden_den",
    name: "Wooden Den",
    research: 5,
    building: true
  },
  {
    id: "stone",
    name: "Stone",
    research: 5
  },
  {
    id: "stone_bricks",
    name: "Stone Bricks",
    research: 10
  },
  {
    id: "stone_house",
    name: "Stone House",
    research: 20,
    building: true
  },
  {
    id: "wood_press",
    name: "Wood Press",
    research: 10
  }
];
var itemUse = {};

// src/items/update.ts
var updateInventoryItem = (itemId) => {
  createInventoryElem(itemId);
  const itemSpan = document.getElementById("inventory." + itemId);
  itemSpan.style.setProperty("--num", game.inventory[itemId] + "");
  itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
};

// src/assignments.ts
var getTotalAssignedLand = () => {
  const nonItem = Object.values(game.landAssignedTypes).reduce((l, c) => l + c, 0);
  let itemForm = 0;
  for (const [id, count] of Object.entries(game.inventory)) {
    const itemData = items.find((item) => item.id === id);
    if (!itemData || !itemData.building)
      continue;
    itemForm += count;
  }
  return nonItem + itemForm;
};
var landAssign = {
  grass_den: (amount) => {
    game.comfort += 1 * amount;
  },
  basic_den: (amount) => {
    game.comfort += 2 * amount;
  },
  wooden_den: (amount) => {
    game.comfort += 5 * amount;
  },
  stone_house: (amount) => {
    game.comfort += 10 * amount;
  }
};
var landUnassign = {
  grass_den: (amount) => {
    game.comfort -= 1 * amount;
  },
  basic_den: (amount) => {
    game.comfort -= 2 * amount;
  },
  wooden_den: (amount) => {
    game.comfort -= 5 * amount;
  },
  stone_house: (amount) => {
    game.comfort -= 10 * amount;
  }
};
var landAssignmentTypes = [
  {
    name: "Food Stockpiles",
    id: "food_stockpiles"
  },
  {
    name: "Research Library",
    id: "research_library"
  },
  {
    name: "Grass Den",
    id: "grass_den"
  }
];
var createAssignmentType = (assignmentType, fromItem) => {
  const assignmentTypeDiv = document.createElement("div");
  const nameAndCount = document.createElement("span");
  nameAndCount.textContent = assignmentType.name + ": ";
  const countSpan = document.createElement("span");
  countSpan.textContent = fromItem ? "" : "0";
  if (fromItem)
    countSpan.classList.add("assignmentItemCount");
  if (fromItem) {
    countSpan.id = "inventory." + assignmentType.id;
  }
  countSpan.dataset.assignmentId = assignmentType.id;
  nameAndCount.appendChild(countSpan);
  assignmentTypeDiv.appendChild(nameAndCount);
  const minusButton = document.createElement("button");
  minusButton.textContent = fromItem ? "Demolish" : "-";
  minusButton.classList.add("assignmentItemDemolish");
  minusButton.dataset.id = assignmentType.id;
  minusButton.addEventListener("click", () => {
    if (fromItem) {
      if (game.inventory[assignmentType.id] <= 0)
        return;
      game.inventory[assignmentType.id] -= 1;
      updateInventoryItem(assignmentType.id);
    } else {
      if (!game.landAssignedTypes[assignmentType.id])
        return;
      game.landAssignedTypes[assignmentType.id] -= 1;
      countSpan.textContent = game.landAssignedTypes[assignmentType.id] + "";
      if (game.landAssignedTypes[assignmentType.id] === 0)
        minusButton.disabled = true;
      document.getElementById("availableLandAssignmentsSpan").textContent = "Available land assignments: " + (game.landAssignments - getTotalAssignedLand());
    }
    landUnassign[assignmentType.id]?.(1);
  });
  assignmentTypeDiv.appendChild(minusButton);
  if (!fromItem) {
    const plusButton = document.createElement("button");
    plusButton.textContent = "+";
    plusButton.addEventListener("click", () => {
      if (game.landAssignments - getTotalAssignedLand() <= 0)
        return;
      game.landAssignedTypes[assignmentType.id] ??= 0;
      game.landAssignedTypes[assignmentType.id] += 1;
      countSpan.textContent = game.landAssignedTypes[assignmentType.id] + "";
      minusButton.disabled = false;
      document.getElementById("availableLandAssignmentsSpan").textContent = "Available land assignments: " + (game.landAssignments - getTotalAssignedLand());
      landAssign[assignmentType.id]?.(1);
    });
    assignmentTypeDiv.appendChild(plusButton);
  }
  document.getElementById("landAssignmentsList").appendChild(assignmentTypeDiv);
};
for (const assignmentType of landAssignmentTypes) {
  createAssignmentType(assignmentType, false);
}

// src/items/create.ts
var sellAmounts = [1, 10, 100];
var createInventoryElem = (id) => {
  if (document.getElementById("inventory." + id))
    return;
  const itemData = items.find((item) => item.id === id);
  if (itemData?.building)
    return createAssignmentType(itemData, true);
  const itemLi = document.createElement("li");
  itemLi.id = "inventory." + id + ".item";
  const itemTopInfo = document.createElement("div");
  itemTopInfo.textContent = `${items.find((item) => item.id === id)?.name} (${items.find((item) => item.id === id)?.research} research each): `;
  const itemSpan = document.createElement("span");
  itemSpan.classList.add("inventoryItemAmount");
  itemSpan.id = "inventory." + id;
  itemTopInfo.appendChild(itemSpan);
  itemLi.appendChild(itemTopInfo);
  const sellRow = document.createElement("div");
  if (itemData?.usable) {
    const useButton = document.createElement("button");
    useButton.textContent = "Use";
    useButton.addEventListener("click", () => {
      if (game.inventory[id] > 0) {
        itemUse[id]?.();
        game.inventory[id] -= 1;
        itemSpan.style.setProperty("--num", game.inventory[id] + "");
        itemSpan.setAttribute("aria-label", game.inventory[id] + "");
        if (game.inventory[id] === 0) {
          itemLi.remove();
        }
      }
    });
    sellRow.appendChild(useButton);
  }
  for (const sellAmount of sellAmounts) {
    const analyzeButton = document.createElement("button");
    analyzeButton.textContent = "Analyze " + sellAmount + "x";
    analyzeButton.classList.add("analyzeButton");
    analyzeButton.dataset.sellAmount = sellAmount + "";
    analyzeButton.addEventListener("click", () => {
      if (game.inventory[id] >= sellAmount) {
        game.inventory[id] -= sellAmount;
        game.researchPoints += sellAmount * (itemData?.research ?? 0);
        updateInventoryItem(id);
      }
    });
    sellRow.appendChild(analyzeButton);
  }
  itemLi.appendChild(sellRow);
  document.getElementById("inventoryList")?.appendChild(itemLi);
};

// src/items/add.ts
var addInventoryItem = (itemId, amount) => {
  const itemData = items.find((item) => item.id === itemId);
  game.inventory[itemId] += amount;
  if (itemData?.building) {
    landAssign[itemId]?.(amount);
  }
  updateInventoryItem(itemId);
};

// src/research.ts
var craftable = [];
var craftAmounts = [1, 10, 100];
var sellAmounts2 = [1, 10, 100];
var technology = [
  {
    name: "Basic Recruitment",
    description: "Recruit more cats to your village!",
    id: "basic_recruitment",
    cost: 50
  },
  {
    name: "Recruitment Propaganda",
    description: "Recruit cats faster!",
    id: "recruitment_propaganda",
    cost: 100,
    requires: ["basic_recruitment"]
  },
  {
    name: "Errands",
    description: "Perform errands for rewards",
    id: "errands",
    cost: 200,
    requires: ["recruitment_propaganda"]
  },
  {
    name: "Tree Chopper",
    description: "Make your cats chop down trees for wood!",
    id: "tree_chopper",
    cost: 300,
    requires: ["basic_recruitment"],
    class: "wood"
  },
  {
    name: "Basic Den",
    description: "A basic den for cats to sleep in.",
    id: "basic_den",
    cost: 300,
    resource_cost: {
      wood: 500
    },
    requires: ["tree_chopper"],
    class: "wood"
  },
  {
    name: "Water Cup",
    description: "Create cups for cats to drink out of.",
    id: "water_cup",
    cost: 300,
    requires: ["basic_den"],
    class: "wood"
  },
  {
    name: "Wooden Plank",
    description: "A fundamental material.",
    id: "wooden_plank",
    cost: 500,
    resource_cost: {
      wood: 1000
    },
    requires: ["basic_den"],
    class: "wood"
  },
  {
    name: "Wooden Den",
    description: "If the basic den too basic for you, make a wooden den.",
    id: "wooden_den",
    cost: 750,
    resource_cost: {
      wooden_plank: 100
    },
    requires: ["wooden_plank"],
    class: "wood"
  },
  {
    name: "Wooden Recruit-board",
    description: "If you want more cats, this is for you.",
    id: "wooden_recruitboard",
    cost: 1000,
    resource_cost: {
      wooden_plank: 500
    },
    requires: ["recruitment_propaganda", "wooden_plank"],
    class: "wood"
  },
  {
    name: "Rock Mining",
    description: "Go mining to gather stone.",
    id: "rock_mining",
    cost: 1500,
    resource_cost: {
      wooden_plank: 100
    },
    requires: ["wooden_plank"],
    class: "stone"
  },
  {
    name: "Stone Bricks",
    description: "Use this for building.",
    id: "stone_bricks",
    cost: 2000,
    resource_cost: {
      stone: 1000
    },
    requires: ["rock_mining"],
    class: "stone"
  },
  {
    name: "Stone House",
    description: "More comfort than a wooden den!",
    id: "stone_house",
    cost: 3000,
    resource_cost: {
      stone_bricks: 1000
    },
    requires: ["wooden_den", "stone_bricks"],
    class: "stone"
  },
  {
    name: "Stone Recruit-board",
    description: "If you want even more cats, this is for you.",
    id: "stone_recruitboard",
    cost: 3000,
    resource_cost: {
      stone_bricks: 5000
    },
    requires: ["wooden_recruitboard", "stone_bricks"],
    class: "stone"
  },
  {
    name: "Wood Press",
    description: "Tired of manually making wooden planks? This machine solves that!",
    id: "wood_press",
    cost: 5000,
    resource_cost: {
      wooden_plank: 1000,
      stone_bricks: 5000
    },
    requires: ["stone_bricks"],
    class: "wood"
  },
  {
    name: "Postal Service",
    description: "Trade with random villages!",
    id: "postal_service",
    cost: 3000,
    resource_cost: {
      wooden_plank: 100,
      stone_bricks: 500
    },
    requires: ["stone_bricks"],
    class: "stone"
  }
];
var craftingRecipes = [
  {
    name: "Basic Den",
    description: "Are your cats not having a good night's sleep? If so, craft the basic den!",
    id: "basic_den",
    result: "basic_den",
    resources: {
      wood: 200
    }
  },
  {
    name: "Water Cup",
    description: "Cats thirsty? Drink water!",
    id: "water_cup",
    result: "water_cup",
    resources: {
      wood: 1
    }
  },
  {
    name: "Wooden Plank",
    description: "Normal wood too weak for you? Make wooden planks!",
    id: "wooden_plank",
    result: "wooden_plank",
    resources: {
      wood: 500
    }
  },
  {
    name: "Wooden Den",
    description: "Want more comfort? Make a wooden den.",
    id: "wooden_den",
    result: "wooden_den",
    resources: {
      wooden_plank: 20
    }
  },
  {
    name: "Stone Bricks",
    description: "Use this for building.",
    id: "stone_bricks",
    result: "stone_bricks",
    resources: {
      stone: 20
    }
  },
  {
    name: "Stone House",
    description: "Want enen more comfort? Make a stone house.",
    id: "stone_house",
    result: "stone_house",
    resources: {
      stone_bricks: 200
    }
  },
  {
    name: "Wood Press",
    description: "Machine that automatically turns wood into wood press. Note: requires cat operator",
    id: "wood_press",
    result: "wood_press",
    resources: {
      wooden_plank: 100,
      stone_bricks: 200
    }
  }
];
var researchCallbacks = {
  basic_recruitment: () => {
    showRecruitmentMenu();
  },
  recruitment_propaganda: () => {
    game.recruitmentCooldown -= 15;
  },
  errands: () => {
    createNewRole("Errand Runner");
  },
  tree_chopper: () => {
    createNewRole("Tree Chopper");
  },
  basic_den: () => {
    craftable.push("basic_den");
    const craftToolButton = document.createElement("button");
    craftToolButton.textContent = "Craft";
    document.getElementById("toolsRow").appendChild(craftToolButton);
    craftToolButton.addEventListener("click", () => {
      if (document.getElementById("craftingDiv"))
        return;
      const craftingDiv = document.createElement("div");
      craftingDiv.id = "craftingDiv";
      craftingDiv.innerHTML = `<b>Crafting</b>
            <p>Hello there! Welcome to the crafting area! What would you like to make today?</p>`;
      document.getElementById("informationList").appendChild(craftingDiv);
      const closeButton = document.createElement("div");
      closeButton.classList.add("closeButton");
      closeButton.setAttribute("aria-label", "Close");
      closeButton.textContent = "X";
      closeButton.addEventListener("click", () => {
        craftingDiv.remove();
      });
      craftingDiv.appendChild(closeButton);
      const recipeListDiv = document.createElement("div");
      craftingDiv.appendChild(recipeListDiv);
      for (const recipeId of craftable) {
        const recipe = craftingRecipes.find((recipe2) => recipe2.id === recipeId);
        const recipeDiv = document.createElement("div");
        recipeDiv.innerHTML = `<b>${recipe.name}</b>
                <div>${recipe.description}</div>
                <div>${Object.entries(recipe.resources).map(([itemId, quantity]) => items.find((item) => item.id === itemId)?.name + ": " + quantity)}`;
        for (const craftAmount of craftAmounts) {
          const craftButton = document.createElement("button");
          craftButton.textContent = "Craft " + craftAmount + "x";
          recipeDiv.appendChild(craftButton);
          recipeListDiv.appendChild(recipeDiv);
          craftButton.addEventListener("click", () => {
            const craftable2 = Object.entries(recipe.resources).reduce((l, [itemId, quantity]) => l && game.inventory[itemId] >= quantity * craftAmount, true);
            if (!craftable2)
              return craftButton.textContent = "Craft " + craftAmount + "x - unaffordable!";
            for (const [itemId, quantity] of Object.entries(recipe.resources)) {
              game.inventory[itemId] -= quantity * craftAmount;
              const itemSpan = document.getElementById("inventory." + itemId);
              itemSpan.style.setProperty("--num", game.inventory[itemId] + "");
              itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
              if (game.inventory[itemId] === 0)
                itemSpan.remove();
            }
            game.inventory[recipe.result] ??= 0;
            addInventoryItem(recipe.result, craftAmount);
            if (!document.getElementById("inventory." + recipe.result)) {
              createInventoryElem(recipe.result);
            }
            const resultSpan = document.getElementById("inventory." + recipe.result);
            resultSpan.style.setProperty("--num", game.inventory[recipe.result] + "");
            resultSpan.setAttribute("aria-label", game.inventory[recipe.result] + "");
          });
        }
      }
    });
  },
  water_cup: () => {
    craftable.push("water_cup");
  },
  wooden_plank: () => {
    craftable.push("wooden_plank");
  },
  wooden_den: () => {
    craftable.push("wooden_den");
  },
  wooden_recruitboard: () => {
    game.recruitmentCooldown -= 10;
  },
  rock_mining: () => {
    createNewRole("Miner");
  },
  stone_bricks: () => {
    craftable.push("stone_bricks");
  },
  stone_house: () => {
    craftable.push("stone_house");
  },
  stone_recruitboard: () => {
    game.recruitmentCooldown -= 10;
  },
  wood_press: () => {
    createNewRole("Wood Press Operator");
    craftable.push("wood_press");
  },
  postal_service: () => {
    const relationsButton = document.createElement("button");
    relationsButton.textContent = "Relations";
    document.getElementById("toolsRow").appendChild(relationsButton);
    relationsButton.addEventListener("click", () => {
      if (document.getElementById("relationsDiv"))
        return;
      const relationsDiv = document.createElement("div");
      relationsDiv.id = "relationsDiv";
      const closeButton = document.createElement("div");
      closeButton.classList.add("closeButton");
      closeButton.setAttribute("aria-label", "Close");
      closeButton.textContent = "X";
      closeButton.addEventListener("click", () => {
        relationsDiv.remove();
      });
      document.getElementById("informationList").appendChild(relationsDiv);
      const mainRelationsPage = () => {
        relationsDiv.innerHTML = `<b>Relations</b>
            <span>Hello there! Welcome to the relations area! What would you like to do today?</span>`;
        relationsDiv.appendChild(closeButton);
        const storeButton = document.createElement("button");
        storeButton.textContent = "Store";
        relationsDiv.appendChild(storeButton);
        storeButton.addEventListener("click", () => {
          storeRelationsPage();
        });
      };
      const storeRelationsPage = () => {
        relationsDiv.innerHTML = `<b>Store</b>
                <span${game.catDollars} cat dollars</span>
                <span>Would you like to sell or buy?</span>`;
        relationsDiv.appendChild(closeButton);
        const sellToolButton = document.createElement("button");
        sellToolButton.textContent = "Sell";
        sellToolButton.addEventListener("click", () => {
          relationsDiv.innerHTML = `<b>Selling</b>
                    <span>What would you like to sell?</span>`;
          relationsDiv.appendChild(closeButton);
          const catDollarspan = document.createElement("span");
          catDollarspan.textContent = game.catDollars + " cat dollars";
          relationsDiv.appendChild(catDollarspan);
          const backButton = document.createElement("button");
          backButton.textContent = "Back";
          relationsDiv.appendChild(backButton);
          backButton.addEventListener("click", storeRelationsPage);
          for (const [itemId, quantity] of Object.entries(game.inventory)) {
            const itemSpan = document.createElement("span");
            itemSpan.classList.add("itemSpan");
            const itemData = items.find((item) => item.id === itemId);
            if (!itemData)
              continue;
            if (!itemData.sell)
              continue;
            const nameAndQuantitySpan = document.createElement("span");
            nameAndQuantitySpan.textContent = `${quantity}x ${itemData.name}`;
            itemSpan.appendChild(nameAndQuantitySpan);
            for (const sellAmount of sellAmounts2) {
              const sellButton = document.createElement("button");
              sellButton.textContent = "Sell " + sellAmount + "x";
              sellButton.addEventListener("click", () => {
                if (sellAmount > quantity)
                  return sellButton.textContent = "Sell " + sellAmount + "x - unaffordable!";
                game.inventory[itemId] -= sellAmount;
                game.catDollars += itemData.sell * sellAmount;
                updateInventoryItem(itemId);
                catDollarspan.textContent = game.catDollars + " cat dollars";
                nameAndQuantitySpan.textContent = `${game.inventory[itemId]}x ${itemData.name}`;
              });
              itemSpan.appendChild(sellButton);
            }
            relationsDiv.appendChild(itemSpan);
          }
        });
        relationsDiv.appendChild(sellToolButton);
        const buyToolButton = document.createElement("button");
        buyToolButton.textContent = "Buy";
        buyToolButton.addEventListener("click", () => {
          relationsDiv.innerHTML = `<b>Buying</b>
                    <span>What would you like to buy?</span>`;
          relationsDiv.appendChild(closeButton);
          const catDollarspan = document.createElement("span");
          catDollarspan.textContent = game.catDollars + " cat dollars";
          relationsDiv.appendChild(catDollarspan);
          const backButton = document.createElement("button");
          backButton.textContent = "Back";
          relationsDiv.appendChild(backButton);
          backButton.addEventListener("click", storeRelationsPage);
          for (const item of items) {
            const itemSpan = document.createElement("span");
            if (!item.buy)
              return;
            itemSpan.textContent = item.name + ": " + item.buy + " cat dollars each";
            itemSpan.classList.add("itemSpan");
            for (const amount of sellAmounts2) {
              const buyButton = document.createElement("button");
              buyButton.textContent = "Buy " + amount + "x";
              buyButton.addEventListener("click", () => {
                if (item.buy * amount > game.catDollars)
                  return buyButton.textContent = "Buy " + amount + "x - unaffordable!";
                addInventoryItem(item.id, amount);
                game.catDollars -= item.buy * amount;
                updateInventoryItem(item.id);
                catDollarspan.textContent = game.catDollars + " cat dollars";
              });
              itemSpan.appendChild(buyButton);
            }
            relationsDiv.appendChild(itemSpan);
          }
        });
        relationsDiv.appendChild(buyToolButton);
      };
      mainRelationsPage();
    });
  }
};
var setupTechnologyItem = (technologyItem) => {
  const technologyElem = document.createElement("li");
  technologyElem.id = technologyItem.id + ".item";
  technologyElem.innerHTML = `<b>${technologyItem.name}</b>
    <p>${technologyItem.description}</p>
    <span>Cost: ${technologyItem.cost} research points${technologyItem.resource_cost ? "<br/>" + Object.entries(technologyItem.resource_cost).map(([id, quantity]) => items.find((item) => item.id === id)?.name + ": " + quantity).join("<br/>") : ""}</span>`;
  if (technologyItem.requires)
    technologyElem.hidden = true;
  if (technologyItem.class)
    technologyElem.classList.add(technologyItem.class);
  const researchButton = document.createElement("button");
  researchButton.textContent = "Research";
  researchButton.disabled = true;
  researchButton.id = technologyItem.id + ".research";
  researchButton.addEventListener("click", () => {
    if (technologyItem.cost > game.researchPoints || (technologyItem.resource_cost ? !Object.entries(technologyItem.resource_cost).reduce((l, [id, amountRequired]) => l && game.inventory[id] >= amountRequired, true) : false))
      return;
    game.researchPoints -= technologyItem.cost;
    if (technologyItem.resource_cost) {
      for (const [itemId, quantity] of Object.entries(technologyItem.resource_cost)) {
        game.inventory[itemId] -= quantity;
        const itemSpan = document.getElementById("inventory." + itemId);
        itemSpan.style.setProperty("--num", game.inventory[itemId] + "");
        itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
        if (game.inventory[itemId] === 0)
          itemSpan.remove();
      }
    }
    game.researched[technologyItem.id] = true;
    technologyElem.hidden = true;
    researchCallbacks[technologyItem.id]();
    for (const technologyNextItem of technology) {
      if (!technologyNextItem.requires || !technologyNextItem.requires.includes(technologyItem.id))
        continue;
      const canResearch = technologyNextItem.requires.reduce((l, c) => l && game.researched[c], true);
      if (canResearch)
        document.getElementById(technologyNextItem.id + ".item").hidden = false;
    }
  });
  technologyElem.appendChild(researchButton);
  document.getElementById("technologyList")?.appendChild(technologyElem);
};

// src/tick.ts
var lastCatStarve = Date.now();
var seasons = [
  {
    name: "Spring",
    description: "Not too hot nor cold.",
    class: "spring"
  },
  {
    name: "Summer",
    description: "Cats can get hot so make sure to craft some water if you can.",
    hot: true,
    class: "summer"
  },
  {
    name: "Autumn",
    description: "Make sure to prepare for winter.",
    class: "autumn"
  },
  {
    name: "Winter",
    description: "Prey is hard to find during winter.",
    cold: true,
    class: "winter"
  }
];
var season = 0;
var seasonLength = 15 * 60;
var secondsUntilNextSeason = seasonLength;
var tick = () => {
  if (game.cats.length === 0) {
    document.getElementById("game").hidden = true;
    document.getElementById("gameOver").hidden = false;
    return;
  }
  let waterLeft = game.inventory.water_cup ?? 0;
  const foodHunted = Math.min(50 * 2 ** game.landSize, Math.floor((seasons[season].cold ? 0.1 : 1) * Math.floor(game.cats.filter((cat) => cat.role === "Hunter" && (seasons[season].hot ? --waterLeft > 0 : true)).reduce((l, c, i) => l + Math.floor(Math.random() * c.abilities.strength) + c.abilities.strength, 0) * (game.comfort / 20 + 1))));
  console.log(waterLeft);
  const requiredFood = game.cats.length * 10 * (game.raid ? 1.5 : 1);
  if (foodHunted - requiredFood > 0) {
    if (game.starvationPoints > 0) {
      game.starvationPoints -= foodHunted - requiredFood;
      if (game.starvationPoints < 0)
        game.starvationPoints = 0;
    } else {
      game.foodStock.push(foodHunted - requiredFood);
    }
  }
  if (foodHunted - requiredFood < 0) {
    if (game.foodStock.length > 0) {
      const difference = requiredFood - foodHunted;
      let takenAway = 0;
      while (takenAway < difference) {
        takenAway += game.foodStock[0];
        game.foodStock.splice(0, 1);
        if (takenAway < difference && game.foodStock.length === 0) {
          game.starvationPoints += difference - takenAway;
          takenAway -= difference;
          break;
        }
      }
      if (difference - takenAway > 0)
        game.foodStock.unshift(difference - takenAway);
    } else {
      game.starvationPoints += requiredFood - foodHunted;
    }
  }
  if (game.foodStock.length > 30) {
    game.foodStock.splice(0, 1);
  }
  const maxFoodStock = (game.landAssignedTypes.food_stockpiles ?? 0) * 200 + 200;
  document.getElementById("maxFoodStock").textContent = maxFoodStock + "";
  if (game.foodStock.reduce((l, c, i) => l + c, 0) > maxFoodStock) {
    const totalSurplus = game.foodStock.reduce((l, c, i) => l + c, 0);
    let takenAway = 0;
    while (takenAway < maxFoodStock - totalSurplus) {
      takenAway += game.foodStock[0];
      game.foodStock.splice(0, 1);
    }
    game.foodStock.unshift(maxFoodStock - game.foodStock.reduce((l, c, i) => l + c, 0) - takenAway);
  }
  if (game.starvationPoints > 500 && Date.now() - lastCatStarve > 9500) {
    lastCatStarve = Date.now();
    const catIndex = Math.floor(Math.random() * game.cats.length);
    const cat = game.cats[catIndex];
    game.cats.splice(catIndex, 1);
    document.getElementById(cat.id + ".catBox")?.remove();
    game.starvationPoints *= game.cats.length / (game.cats.length + 1);
    game.starvationPoints = Math.ceil(game.starvationPoints);
    if (game.starvationPoints > 500)
      game.starvationPoints = 500;
  }
  document.getElementById("foodHunted").textContent = `${foodHunted}/${requiredFood}`;
  const displayFoodStock = game.starvationPoints > 0 ? -game.starvationPoints + "" : game.foodStock.reduce((l, c, i) => l + c, 0) + "";
  document.getElementById("foodStock").style.setProperty("--num", displayFoodStock);
  document.getElementById("foodStock").setAttribute("aria-label", displayFoodStock);
  const defense = game.cats.filter((cat) => cat.role === "Guard").reduce((l, c, i) => l + Math.floor((c.abilities.strength + c.abilities.agility) / 5), 0);
  document.getElementById("defense").textContent = defense + "";
  let researchGained = 0;
  for (const cat of game.cats.filter((cat2) => cat2.role === "Researcher")) {
    let currentGain = Math.floor(cat.abilities.intelligence * Math.random() * (game.comfort / 20 + 1));
    cat.skills ??= {};
    cat.skills.researching ??= { level: 0, xp: 0 };
    if (Math.random() < 0.1)
      cat.skills.researching.xp += 1;
    if (cat.skills.researching.xp >= 100 && cat.skills.researching.level < 3) {
      cat.skills.researching.level = 3;
      cat.skills.researching.xp = 0;
    }
    recalculateCatSkills(cat);
    switch (cat.skills.researching.level) {
      case 1:
        currentGain *= 1.1;
        break;
      case 2:
        currentGain *= 1.5;
        break;
      case 3:
        currentGain *= 2;
        break;
    }
    currentGain = Math.floor(currentGain);
    researchGained += currentGain;
  }
  game.researchPoints += researchGained;
  const maxResearchPoints = (game.landAssignedTypes.research_library ?? 0) * 200 + 200;
  if (game.researchPoints > maxResearchPoints)
    game.researchPoints = maxResearchPoints;
  document.getElementById("maxResearchPoints").textContent = maxResearchPoints + "";
  document.getElementById("researchPoints").style.setProperty("--num", game.researchPoints + "");
  document.getElementById("researchPoints").setAttribute("aria-label", game.researchPoints + "");
  document.getElementById("comfort").style.setProperty("--num", game.comfort * 5 + "");
  document.getElementById("comfort").setAttribute("aria-label", game.comfort * 5 + "");
  if (game.foodStock.reduce((l, c, i) => l + c, 0) > 500 && Math.random() < 0.01 / defense && !game.raid) {
    document.getElementById("raid").hidden = false;
    document.getElementById("raidText").textContent = "You are being raided. You will use up 1.5x the amount of prey during the raid.";
    let timeLeft = 30 - Math.floor(Math.random() * defense);
    document.getElementById("raidTimer").textContent = timeLeft + "s left";
    game.raid = true;
    const raidInterval = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        document.getElementById("raid").hidden = true;
        game.raid = false;
        clearInterval(raidInterval);
      }
      document.getElementById("raidTimer").textContent = timeLeft + "s left";
    }, 1000);
  }
  for (const technologyItem of technology) {
    const technologyElem = document.getElementById(technologyItem.id + ".research");
    technologyElem.disabled = technologyItem.cost > game.researchPoints || (technologyItem.resource_cost ? !Object.entries(technologyItem.resource_cost).reduce((l, [id, amountRequired]) => l && game.inventory[id] >= amountRequired, true) : false);
  }
  secondsUntilNextSeason -= 1;
  if (secondsUntilNextSeason <= 0) {
    if (season === seasons.length - 1) {
      season = 0;
    } else {
      season += 1;
    }
    secondsUntilNextSeason = seasonLength;
    game.researchPoints -= game.landSize * 100;
    if (game.researchPoints < 0)
      game.researchPoints = 0;
  }
  if (seasons[season].class)
    document.getElementById("seasonBox").className = seasons[season].class;
  document.getElementById("seasonName").textContent = seasons[season].name;
  document.getElementById("seasonDescription").innerHTML = seasons[season].description + "<br/<br/>" + secondsUntilNextSeason + " seconds left until " + (season === seasons.length - 1 ? seasons[0].name : seasons[season + 1].name);
  document.getElementById("landSize").textContent = game.landSize + "";
  document.getElementById("maxPrey").textContent = 50 * 2 ** game.landSize + "";
  document.getElementById("expand").textContent = "Expand: " + 100 * 3 ** game.landSize + " research points";
  document.getElementById("expand").disabled = game.researchPoints < 100 * 3 ** game.landSize;
  document.getElementById("availableLandAssignmentsSpan").textContent = "Available land assignments: " + (game.landAssignments - getTotalAssignedLand());
  if (game.inventory.water_cup) {
    game.inventory.water_cup = Math.max(0, waterLeft);
    const waterCupSpan = document.getElementById("inventory.water_cup");
    waterCupSpan.style.setProperty("--num", game.inventory.water_cup + "");
    waterCupSpan.setAttribute("aria-label", game.inventory.water_cup + "");
  }
  let woodGained = 0;
  for (const cat of game.cats.filter((cat2) => cat2.role === "Tree Chopper")) {
    woodGained += Math.floor(Math.random() * 5 * Math.floor(cat.abilities.strength / 5));
    cat.skills ??= {};
    cat.skills.treeChopping ??= { level: 0, xp: 0 };
    if (Math.random() < 0.1)
      cat.skills.treeChopping.xp += 1;
    if (cat.skills.treeChopping.xp >= 100 && cat.skills.treeChopping.level < 3) {
      cat.skills.treeChopping.level = 3;
      cat.skills.treeChopping.xp = 0;
    }
    recalculateCatSkills(cat);
    switch (cat.skills.treeChopping.xp) {
      case 1:
        woodGained *= 1.1;
        break;
      case 2:
        woodGained *= 1.5;
        break;
      case 3:
        woodGained *= 2;
        break;
    }
    woodGained = Math.floor(woodGained);
  }
  if (woodGained) {
    game.inventory.wood ??= 0;
    game.inventory.wood += woodGained;
    if (!document.getElementById("inventory.wood")) {
      createInventoryElem("wood");
    }
    const woodSpan = document.getElementById("inventory.wood");
    woodSpan.style.setProperty("--num", game.inventory.wood + "");
    woodSpan.setAttribute("aria-label", game.inventory.wood + "");
  }
  let stoneGained = 0;
  for (const cat of game.cats.filter((cat2) => cat2.role === "Tree Chopper")) {
    stoneGained += Math.floor(Math.random() * 5 * Math.floor(cat.abilities.strength / 5));
    cat.skills ??= {};
    cat.skills.mining ??= { level: 0, xp: 0 };
    if (Math.random() < 0.1)
      cat.skills.mining.xp += 1;
    if (cat.skills.mining.xp >= 100 && cat.skills.mining.level < 3) {
      cat.skills.mining.level = 3;
      cat.skills.mining.xp = 0;
    }
    recalculateCatSkills(cat);
    switch (cat.skills.mining.xp) {
      case 1:
        stoneGained *= 1.1;
        break;
      case 2:
        stoneGained *= 1.5;
        break;
      case 3:
        stoneGained *= 2;
        break;
    }
    stoneGained = Math.floor(stoneGained);
  }
  if (stoneGained) {
    game.inventory.stone ??= 0;
    game.inventory.stone += stoneGained;
    if (!document.getElementById("inventory.stone")) {
      createInventoryElem("stone");
    }
    const stoneSpan = document.getElementById("inventory.stone");
    stoneSpan.style.setProperty("--num", game.inventory.stone + "");
    stoneSpan.setAttribute("aria-label", game.inventory.stone + "");
  }
  for (const item of items) {
    const itemElem = document.getElementById("inventory." + item.id + ".div");
    if (!itemElem)
      continue;
    itemElem.querySelectorAll(".analyzeButton").forEach((analyzeButton) => {
      const sellAmount = +analyzeButton.dataset.sellAmount;
      analyzeButton.disabled = game.inventory[item.id] < sellAmount;
    });
  }
  const woodPressOperators = game.cats.filter((cat) => cat.role === "Wood Press Operator").length;
  if (woodPressOperators) {
    const woodenPlanksGained = Math.min(woodPressOperators, game.inventory.wood_press ?? 0, Math.floor(game.inventory.wood / 500));
    game.inventory.wooden_plank ??= 0;
    game.inventory.wooden_plank += woodenPlanksGained;
    if (!document.getElementById("inventory.wooden_plank")) {
      createInventoryElem("wooden_plank");
    }
    const woodPlankSpan = document.getElementById("inventory.wooden_plank");
    woodPlankSpan.style.setProperty("--num", game.inventory.wooden_plank + "");
    woodPlankSpan.setAttribute("aria-label", game.inventory.wooden_plank + "");
    game.inventory.wood -= woodenPlanksGained * 500;
  }
  for (const demolishButton of Array.from(document.getElementsByClassName("assignmentItemDemolish"))) {
    const itemId = demolishButton.dataset.id;
    demolishButton.disabled = game.inventory[itemId] <= 0;
  }
  localStorage.setItem("save", JSON.stringify({
    researched: game.researched,
    cats: game.cats,
    foodStock: game.foodStock,
    researchPoints: game.researchPoints,
    starvationPoints: game.starvationPoints,
    comfort: game.comfort,
    inventory: game.inventory,
    landSize: game.landSize,
    landAssignedTypes: game.landAssignedTypes,
    claimedQuests: game.claimedQuests
  }));
  console.log(localStorage.getItem("save"));
  console.log("cats: " + game.cats.length);
};

// src/index.ts
document.getElementById("start")?.addEventListener("click", () => {
  console.log("click");
  document.getElementById("titleScreen").hidden = true;
  document.getElementById("welcomeScreen").innerHTML = `<b>Welcome to Cat Village Simulator</b><p>To get started, choose the cats who wil join you.</p>`;
  const recruitCountSpan = document.createElement("span");
  recruitCountSpan.textContent = "0/3 cats recruited";
  document.getElementById("welcomeScreen").appendChild(recruitCountSpan);
  const catGridElement = document.createElement("div");
  catGridElement.classList.add("catGrid");
  document.getElementById("welcomeScreen").appendChild(catGridElement);
  const recruitedCats = [];
  for (let i = 0;i < 12; i++) {
    const catElement = document.createElement("div");
    catElement.classList.add("catBox");
    const cat = randomCat();
    catElement.innerHTML = `<b>${cat.name}</b>
        ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
      return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find((ability) => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`;
    }).join("")}`;
    const recruitButton = document.createElement("button");
    recruitButton.textContent = "Recruit";
    catElement.appendChild(recruitButton);
    recruitButton.addEventListener("click", () => {
      const catIndex = recruitedCats.findIndex((currentCat) => currentCat.id === cat.id);
      if (catIndex !== -1) {
        recruitButton.textContent = "Recruit";
        recruitedCats.splice(catIndex, 1);
      } else {
        if (recruitedCats.length >= 3)
          return;
        recruitButton.textContent = "Unrecruit";
        recruitedCats.push(cat);
      }
      recruitCountSpan.textContent = recruitedCats.length + "/3 cats recruited";
      startJourneyButton.textContent = "Start your journey";
    });
    catGridElement.appendChild(catElement);
  }
  const startJourneyButton = document.createElement("button");
  startJourneyButton.textContent = "Start your journey";
  startJourneyButton.classList.add("bigButton");
  document.getElementById("welcomeScreen").appendChild(startJourneyButton);
  startJourneyButton.addEventListener("click", () => {
    if (recruitedCats.length < 3) {
      startJourneyButton.textContent = "Start your journey - recruit 3 cats first!";
      return;
    }
    game.cats = recruitedCats.map((cat) => ({ ...cat, skills: {}, role: "Hunter" }));
    document.getElementById("welcomeScreen").hidden = true;
    document.getElementById("game").hidden = false;
    for (const cat of game.cats) {
      createCatElement(cat);
    }
    game.landAssignments = 5 ** game.landSize;
    document.getElementById("researchTaxAmount").textContent = game.landSize * 100 + "";
    setInterval(tick, 1000);
    for (const technologyItem of technology) {
      setupTechnologyItem(technologyItem);
    }
  });
});
if (!localStorage.getItem("save"))
  document.getElementById("continue").hidden = true;
document.getElementById("continue")?.addEventListener("click", () => {
  const save = JSON.parse(localStorage.getItem("save"));
  if (save.cats.length === 0)
    return document.getElementById("continue").textContent = "No cats?";
  game.researched = save.researched;
  game.cats = save.cats;
  game.foodStock = save.foodStock;
  game.researchPoints = save.researchPoints;
  game.starvationPoints = save.starvationPoints;
  game.comfort = save.comfort;
  game.inventory = save.inventory;
  game.landSize = save.landSize;
  document.getElementById("researchTaxAmount").textContent = game.landSize * 100 + "";
  game.landAssignments = 5 ** game.landSize;
  game.landAssignedTypes = save.landAssignedTypes;
  game.claimedQuests = save.claimedQuests;
  for (const [id, count] of Object.entries(save.landAssignedTypes)) {
    if (document.querySelector("[data-assignment-id=" + id + "]"))
      document.querySelector("[data-assignment-id=" + id + "]").textContent = count + "";
  }
  console.log(game.landAssignedTypes);
  for (const cat of game.cats) {
    createCatElement(cat);
    recalculateCatSkills(cat);
  }
  for (const technologyItem of technology) {
    setupTechnologyItem(technologyItem);
    if (technologyItem.requires) {
      const canResearch = technologyItem.requires.reduce((l, c) => l && game.researched[c], true);
      if (canResearch)
        document.getElementById(technologyItem.id + ".item").hidden = false;
    }
    if (technologyItem.id in game.researched) {
      document.getElementById(technologyItem.id + ".item").hidden = true;
    }
  }
  for (const itemId of Object.keys(game.inventory)) {
    createInventoryElem(itemId);
    const itemSpan = document.getElementById("inventory." + itemId);
    itemSpan.style.setProperty("--num", game.inventory[itemId] + "");
    itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
  }
  for (const researchId of Object.keys(game.researched)) {
    researchCallbacks[researchId]();
  }
  for (const cat of game.cats) {
    const roleSelect = document.getElementById(cat.id + ".roleSelect");
    roleSelect.selectedIndex = roles.indexOf(cat.role);
  }
  document.getElementById("titleScreen").hidden = true;
  document.getElementById("game").hidden = false;
  setInterval(tick, 1000);
});
document.getElementById("expand").addEventListener("click", () => {
  if (game.researchPoints < 100 * 3 ** game.landSize)
    return;
  game.researchPoints -= 100 * 3 ** game.landSize;
  game.landSize += 1;
  game.landAssignments = 5 ** game.landSize;
  document.getElementById("researchTaxAmount").textContent = game.landSize * 100 + "";
});
var changeTabs = (e) => {
  const targetTab = e.target;
  const tabList = targetTab.parentNode;
  const tabGroup = tabList.parentNode;
  tabList.querySelectorAll(':scope > [aria-selected="true"]').forEach((tab) => tab.setAttribute("aria-selected", "false"));
  targetTab.setAttribute("aria-selected", "true");
  tabGroup.querySelectorAll(':scope > [role="tabpanel"]').forEach((tab) => tab.setAttribute("hidden", "true"));
  tabGroup.querySelector(`#${targetTab.getAttribute("aria-controls")}`)?.removeAttribute("hidden");
};
for (const tabList of Array.from(document.querySelectorAll(`[role="tablist"]`))) {
  const tabs = tabList.querySelectorAll(':scope > [role="tab"]');
  tabs.forEach((tab) => {
    tab.addEventListener("click", changeTabs);
  });
  let tabFocus = 0;
  tabList.addEventListener("keydown", (e) => {
    if (!(e instanceof KeyboardEvent))
      return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      tabs[tabFocus].setAttribute("tabindex", "-1");
      if (e.key === "ArrowRight") {
        tabFocus++;
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
      } else if (e.key === "ArrowLeft") {
        tabFocus--;
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }
      tabs[tabFocus].setAttribute("tabindex", "0");
      tabs[tabFocus].focus();
    }
  });
}
var quests = [
  {
    id: "reach-5-cats",
    name: "Reach 5 cats",
    requirements: {
      cats: 5
    },
    rewards: {
      research: 500
    }
  }
];
document.getElementById("visitQuestOffice")?.addEventListener("click", () => {
  if (document.getElementById("questsDiv"))
    return;
  const questsDiv = document.createElement("div");
  questsDiv.id = "questsDiv";
  questsDiv.innerHTML = `<b>Quests</b>
    <p>Here are some of the quests you can perform.</p>`;
  document.getElementById("informationList").appendChild(questsDiv);
  const closeButton = document.createElement("div");
  closeButton.classList.add("closeButton");
  closeButton.setAttribute("aria-label", "Close");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => {
    questsDiv.remove();
  });
  questsDiv.appendChild(closeButton);
  for (const quest of quests) {
    const questDiv = document.createElement("div");
    questDiv.textContent = quest.name;
    questDiv.classList.add("quest");
    questsDiv.appendChild(questDiv);
    const claimButton = document.createElement("button");
    claimButton.textContent = "Claim";
    for (const [type, requirement] of Object.entries(quest.requirements)) {
      if (type === "cats") {
        if (game.cats.length < requirement)
          claimButton.disabled = true;
      }
    }
    for (const [type, reward] of Object.entries(quest.rewards)) {
      if (type === "research") {
        const rewardSpan = document.createElement("span");
        rewardSpan.textContent = "+" + reward + " research";
        questDiv.appendChild(rewardSpan);
      }
    }
    if (game.claimedQuests.includes(quest.id))
      claimButton.disabled = true;
    questDiv.appendChild(claimButton);
    claimButton.addEventListener("click", () => {
      for (const [type, reward] of Object.entries(quest.rewards)) {
        if (type === "research") {
          game.researchPoints += reward;
        }
      }
      claimButton.disabled = true;
      game.claimedQuests.push(quest.id);
    });
  }
});

//# debugId=FBFA72815AF78C7464756E2164756E21
//# sourceMappingURL=index.js.map
