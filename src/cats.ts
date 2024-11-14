import { game } from "./game.ts"

const catNames = (await (await fetch("./cat_names.txt")).text()).split("\n");
const randomCatName = () => catNames[Math.floor(Math.random() * catNames.length)]
export const abilities = [
    {
        "id": "strength",
        "name": "Strength"
    },
    {
        "id": "intelligence",
        "name": "Intelligence"
    },
    {
        "id": "agility",
        "name": "Agility"
    },
    {
        "id": "dexterity",
        "name": "Dexterity"
    },
]
export interface Cat {
    id: string,
    name: string,
    abilities: Record<string, number>,
    role: string
}
export interface PartialCat {
    id: string,
    name: string,
    abilities: Record<string, number>
}
export const randomCat = () => {
    const cat: PartialCat = {
        "id": Math.random() + "",
        "name": randomCatName(),
        "abilities": {}
    }
    for (const ability of abilities) {
        cat.abilities[ability.id] = Math.floor(Math.random() * 10) + 5
    }
    return cat
}

export const roles = ["Hunter", "Guard", "Researcher"];

export const createCatElement = (cat: Cat) => {
    const catElement = document.createElement("li");
    catElement.id = cat.id + ".catBox";
    catElement.classList.add("catBox");
    catElement.innerHTML = `<b>${cat.name}</b>
    ${Object.entries(cat.abilities).map(([abilityId, abilityNumber]) => {
        return `<label id="${cat.id}.${abilityId}.label" for="${cat.id}.${abilityId}">${abilities.find(ability => ability.id === abilityId)?.name + ": " + abilityNumber}</label><meter id="${cat.id}.${abilityId}" min="1" max="20" value="${abilityNumber}" aria-labelledby="${cat.id}.${abilityId}.label"></meter>`
    }).join("")}`;
    document.getElementById("catList")?.appendChild(catElement);
    const roleLabel = document.createElement("label");
    roleLabel.textContent = "Role";
    roleLabel.setAttribute("for", cat.id + ".roleSelect")
    catElement.appendChild(roleLabel)
    const roleSelect = document.createElement("select");
    roleSelect.id = cat.id + ".roleSelect";
    for (const role of roles) {
        const roleOption = document.createElement("option");
        roleOption.textContent = role;
        roleSelect.appendChild(roleOption);
    };
    catElement.appendChild(roleSelect);
    roleSelect.addEventListener("change", () => {
        cat.role = roleSelect.options[roleSelect.selectedIndex].text;
    });
};

export const createNewRole = (roleName: string) => {
    roles.push(roleName)
    for (const cat of game.cats) {
        const catElement = document.getElementById(cat.id + ".catBox")!;
        const roleOption = document.createElement("option")
        roleOption.textContent = roleName;
        catElement.querySelector("select")?.appendChild(roleOption);
    }
}