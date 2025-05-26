import { CustomCommandParamType, system, world } from "@minecraft/server";
import { transferPlayer } from "@minecraft/server-admin";

system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand(
        {
            name: "wl:join",
            description: "特定のプレイヤーをホワイトリストに追加します。",
            permissionLevel: 0,
            mandatoryParameters: [
                {
                    name: "対象",
                    type: CustomCommandParamType.String
                }
            ]
        },
        (result, targets) => {
            system.run(() => {
                const scoreboard = world.scoreboard;
                const object = scoreboard.getObjective("whitelist");
                object.setScore(`${targets}@`, 0);
            });
            return {
                message: "§aプレイヤー §b§l" + targets + "§r§a をホワイトリストに追加しました。",
                status: 0
            }
        }
    ),
        ev.customCommandRegistry.registerCommand(
            {
                name: "wl:delete",
                description: "特定のプレイヤーをホワイトリストから削除します。",
                permissionLevel: 0,
                mandatoryParameters: [
                    {
                        name: "対象",
                        type: CustomCommandParamType.String
                    }
                ]
            },
            (result, targets) => {
                const { initiator, sourceType, sourceBlock, sourceEntity } = result;
                system.run(() => {
                    sourceEntity.runCommand(`scoreboard players reset "${targets}@" whitelist`)
                });
                return {
                    message: "§cプレイヤー §b§l" + targets + "§r§c をホワイトリストから削除しました。",
                    status: 0
                }
            }
        )
});

world.afterEvents.playerSpawn.subscribe(ev => {
    const player = ev.player;
    try {
        let objectives = world.scoreboard.getObjective("whitelist");
        let map = objectives.getParticipants().map(
            (objective) => objective.displayName
        );
        if ([...map.values()].includes(player.name + "@")) return;
        transferPlayer(player, "cryst.ddns.net", 19132);
        world.sendMessage(player.name + "はキックされました。");
    } catch (error) {
        player.runCommand(`scoreboard objectives add whitelist dummy`)
        player.runCommand(`scoreboard players set "${player.name}@" whitelist 0`)
    }
});