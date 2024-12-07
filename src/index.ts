import { randomCat, abilities, createCatElement, roles, recalculateCatSkills } from "./cats.ts"
import type { PartialCat } from "./cats.ts"
import { game } from "./game.ts"
import { tick } from "./tick.ts"
import { technology, setupTechnologyItem, researchCallbacks } from "./research.ts"
import { createInventoryElem } from "./items/create.ts"

document.getElementById("start")?.addEventListener("click", () => {
    console.log("click")
    document.getElementById("titleScreen")!.hidden = true;
    document.getElementById("welcomeScreen")!.innerHTML = `<b>Welcome to Cat Village Simulator</b><p>To get started, choose the cats who wil join you.</p>`
    const recruitCountSpan = document.createElement("span");
    recruitCountSpan.textContent = "0/3 cats recruited";
    document.getElementById("welcomeScreen")!.appendChild(recruitCountSpan);
    const catGridElement = document.createElement("div");
    catGridElement.classList.add("catGrid");
    document.getElementById("welcomeScreen")!.appendChild(catGridElement);
    const recruitedCats: PartialCat[] = [];
    for (let i = 0; i < 12; i++) {
        const catElement = document.createElement("div");
        catElement.classList.add("catBox");
        const cat = randomCat();
        catElement.innerHTML = `<b>${cat.name}</b>
        ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
            return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find(ability => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`
        }).join("")}`;
        const recruitButton = document.createElement("button");
        recruitButton.textContent = "Recruit";
        catElement.appendChild(recruitButton);
        recruitButton.addEventListener("click", () => {
            const catIndex = recruitedCats.findIndex(currentCat => currentCat.id === cat.id)
            if (catIndex !== -1) {
                recruitButton.textContent = "Recruit"
                recruitedCats.splice(catIndex, 1);
            } else {
                if (recruitedCats.length >= 3) return;
                recruitButton.textContent = "Unrecruit";
                recruitedCats.push(cat);
            }
            recruitCountSpan.textContent = recruitedCats.length + "/3 cats recruited"
            startJourneyButton.textContent = "Start your journey";
        });
        catGridElement.appendChild(catElement);
    };
    const startJourneyButton = document.createElement("button");
    startJourneyButton.textContent = "Start your journey";
    startJourneyButton.classList.add("bigButton");
    document.getElementById("welcomeScreen")!.appendChild(startJourneyButton);
    startJourneyButton.addEventListener("click", () => {
        if (recruitedCats.length < 3) {
            startJourneyButton.textContent = "Start your journey - recruit 3 cats first!"
            return
        }
        game.cats = recruitedCats.map(cat => ({...cat, skills: {}, role: "Hunter"}))
        document.getElementById("welcomeScreen")!.hidden = true;
        document.getElementById("game")!.hidden = false;
        for (const cat of game.cats) {
            createCatElement(cat);
        };
        game.landAssignments = 5 ** game.landSize;
        setInterval(tick, 1000);
        for (const technologyItem of technology) {
            setupTechnologyItem(technologyItem)
        }
    })
});

if (!localStorage.getItem("save")) document.getElementById("continue")!.hidden = true;

document.getElementById("continue")?.addEventListener("click", () => {
    const save = JSON.parse(localStorage.getItem("save")!) //, JSON.stringify({researched, cats, foodStock, researchPoints, starvationPoints, comfort, inventory}))
    if (save.cats.length === 0) return document.getElementById("continue")!.textContent = "No cats?"
    game.researched = save.researched;
    game.cats = save.cats;
    game.foodStock = save.foodStock;
    game.researchPoints = save.researchPoints;
    game.starvationPoints = save.starvationPoints;
    game.comfort = save.comfort;
    game.inventory = save.inventory;
    game.landSize = save.landSize;
    game.landAssignments = 5 ** game.landSize;
    game.landAssignedTypes = save.landAssignedTypes;
    for (const [id, count] of Object.entries(save.landAssignedTypes)) {
        if (document.querySelector("[data-assignment-id=" + id + "]")) document.querySelector("[data-assignment-id=" + id + "]")!.textContent = count + ""
    }
    console.log(game.landAssignedTypes)
    for (const cat of game.cats) {
        createCatElement(cat);
        recalculateCatSkills(cat);
    };
    for (const technologyItem of technology) {
        setupTechnologyItem(technologyItem);
        if (technologyItem.requires) {
            const canResearch = technologyItem.requires.reduce((l, c) => l && game.researched[c], true);
            if (canResearch) document.getElementById(technologyItem.id + ".item")!.hidden = false;
        };
        if (technologyItem.id in game.researched) {
            document.getElementById(technologyItem.id + ".item")!.hidden = true;
        };
    };
    for (const itemId of Object.keys(game.inventory)) {
        createInventoryElem(itemId)
        const itemSpan = document.getElementById("inventory." + itemId)!
        itemSpan.style.setProperty("--num", game.inventory[itemId] + "")
        itemSpan.setAttribute("aria-label", game.inventory[itemId] + "")
    }
    for (const researchId of Object.keys(game.researched)) {
        researchCallbacks[researchId]();
    }
    for (const cat of game.cats) {
        const roleSelect = document.getElementById(cat.id + ".roleSelect") as HTMLSelectElement;
        roleSelect.selectedIndex = roles.indexOf(cat.role)
    }
    document.getElementById("titleScreen")!.hidden = true;
    document.getElementById("game")!.hidden = false;
    setInterval(tick, 1000);
});

document.getElementById("expand")!.addEventListener("click", () => {
    if (game.researchPoints < 100 * 3 ** game.landSize) return;
    game.researchPoints -= 100 * 3 ** game.landSize;
    game.landSize += 1;
    game.landAssignments = 5 ** game.landSize;
})

const changeTabs = (e: Event) => {
    const targetTab = e.target as HTMLButtonElement;
    const tabList = targetTab.parentNode!;
    const tabGroup = tabList.parentNode!;
    tabList
      .querySelectorAll(':scope > [aria-selected="true"]')
      .forEach(tab => tab.setAttribute("aria-selected", "false"));
    targetTab.setAttribute("aria-selected", "true");
    
    tabGroup
      .querySelectorAll(':scope > [role="tabpanel"]')
      .forEach(tab => tab.setAttribute("hidden", "true"));
  
    tabGroup
      .querySelector(`#${targetTab.getAttribute("aria-controls")}`)
      ?.removeAttribute("hidden");
}

for (const tabList of Array.from(document.querySelectorAll(`[role="tablist"]`))) {
    const tabs = tabList.querySelectorAll(':scope > [role="tab"]');
  
    tabs.forEach((tab) => {
      tab.addEventListener("click", changeTabs);
    });
  
    let tabFocus = 0;
  
    tabList.addEventListener("keydown", (e) => {
        if (!(e instanceof KeyboardEvent)) return;
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
            (tabs[tabFocus] as HTMLButtonElement).focus();
        }
    });
}
