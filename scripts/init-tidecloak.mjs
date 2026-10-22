// Initialise a CareVault realm on local tidecloak-dev, reusing Tide's official
// playground apiService (same call order as its LoadingPage initializer).
// Usage (from repo root):
//   git clone --depth 1 https://github.com/tide-foundation/tidecloak-playground.git scripts/.playground
//   node scripts/init-tidecloak.mjs
import fs from "fs";
import path from "path";
import api from "./.playground/app/api/apiService.js";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(HERE, "..");
const BASE = "http://localhost:8080";
const REALM = "carevault";
const CLIENT = "carevault";
const APP_URL = "http://localhost:5173";
const TAGS = ["cardio", "psych"];

// Users: Lan (patient) owns records; agent + sysadmin are the "should fail" actors.
// agent gets the same decrypt role as Lan to prove the role alone is not enough.
const USERS = [
  { username: "lan", roles: TAGS.flatMap((t) => [`_tide_${t}.selfencrypt`, `_tide_${t}.selfdecrypt`]) },
  { username: "agent", roles: ["_tide_cardio.selfdecrypt"] },
  { username: "sysadmin", roles: [] },
];

function step(name) { console.log(`\n== ${name}`); }

async function findUser(token, username) {
  const r = await fetch(`${BASE}/admin/realms/${REALM}/users?username=${username}&exact=true`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const list = await r.json();
  return list[0];
}

const settings = JSON.parse(
  fs.readFileSync(path.join(HERE, ".playground/tidecloak-demo-realm.json"), "utf8")
    .replaceAll("tidecloak-demo", REALM)
    .replaceAll("_tide_dob.", "_tide_cardio.")
    .replaceAll("_tide_cc.", "_tide_psych.")
    .replaceAll('"myclient"', `"${CLIENT}"`)
    .replaceAll("http://localhost:3000", APP_URL)
);

let token = await api.getMasterToken(BASE);

step("createRealm");
console.log(await api.createDefaultRealm(BASE, settings, token));

step("setUpTideRealm (license)");
console.log(await api.activateIDPLicense(BASE, REALM, token));

step("toggleIGA");
token = await api.getMasterToken(BASE);
const rep = (await api.getRealmRepresentation(BASE, REALM, token)).body;
rep.attributes = { ...(rep.attributes || {}), "iga.attestor": "tide" };
await api.updateRealmRepresentation(BASE, REALM, rep, token);
console.log(await api.toggleIGA(BASE, REALM, token));
await api.drainChangeRequests(BASE, REALM);

step("createUsers");
token = await api.getMasterToken(BASE);
for (const u of USERS) {
  console.log(u.username, await api.createUser(BASE, REALM, token, u.username, "", "", true));
}
await api.drainChangeRequests(BASE, REALM);

step("assignRealmRoles");
for (const u of USERS) {
  token = await api.getMasterToken(BASE);
  const user = await findUser(token, u.username);
  const available = (await api.getAvailableRealmRoles(BASE, REALM, user.id, token)).body;
  for (const roleName of u.roles) {
    const role = available.find((r) => r.name === roleName);
    if (!role) throw new Error(`role not available: ${roleName}`);
    await api.assignRealmRole(BASE, REALM, user.id, role, token);
    await api.drainChangeRequests(BASE, REALM);
    console.log(`${u.username} += ${roleName}`);
  }
}
await api.drainChangeRequests(BASE, REALM);

step("customDomain + signSettings");
token = await api.getMasterToken(BASE);
let idp = (await api.getIDPSettings(BASE, REALM, token)).body;
idp.config.CustomAdminUIDomain = APP_URL;
await api.updateIDPSettings(BASE, REALM, idp, token);
console.log(await api.signSettings(BASE, REALM, token));
idp = (await api.getIDPSettings(BASE, REALM, token)).body;
idp.config.CustomAdminUIDomain = `${APP_URL}?linkedTide=true`;
await api.updateIDPSettings(BASE, REALM, idp, token);

step("adapter -> public/tidecloak.json");
const clientID = (await api.getClientID(BASE, REALM, CLIENT, token)).body;
const adapter = (await api.getClientAdapter(BASE, REALM, clientID, token)).body;
fs.writeFileSync(path.join(APP_DIR, "public/tidecloak.json"), JSON.stringify(JSON.parse(adapter), null, 2) + "\n");
console.log("written");

step("Tide account link invites (open each in a browser)");
const links = {};
for (const u of USERS) {
  token = await api.getMasterToken(BASE);
  const user = await findUser(token, u.username);
  links[u.username] = (await api.createTideInvite(BASE, REALM, user.id, token)).body;
  console.log(`${u.username}: ${links[u.username]}`);
}
// Invite links are credentials; they are printed only, never written to the repo.
