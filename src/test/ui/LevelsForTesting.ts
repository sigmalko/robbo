import type { Level, LevelProvider } from "../../main/levels/LevelProvider";

export class LevelsForTesting implements LevelProvider {
    downloadLevel(id:number):Level {
        switch(id) {
            case 1:
                return this.rows3cols3easy();
            default:
                return this.emptyLevel();
        }
    }

    emptyLevel():Level {
        return {
            objects: [

            ]
        };
    }

    rows3cols3easy():Level {
        return {
            objects: [
                // 0
                {
                    position: {
                        x: 0,
                        y: 0
                    },
                    type: "wall"
                },
                {
                    position: {
                        x: 1,
                        y: 0
                    },
                    type: "wall"
                },
                {
                    position: {
                        x: 2,
                        y: 0
                    },
                    type: "wall"
                },

                // 1
                {
                    position: {
                        x: 0,
                        y: 1
                    },
                    type: "wall"
                },
                {
                    position: {
                        x: 1,
                        y: 1
                    },
                    type: "empty"
                },
                {
                    position: {
                        x: 2,
                        y: 1
                    },
                    type: "wall"
                },

                // 2
                {
                    position: {
                        x: 0,
                        y: 2
                    },
                    type: "wall"
                },
                {
                    position: {
                        x: 1,
                        y: 2
                    },
                    type: "wall"
                },
                {
                    position: {
                        x: 2,
                        y: 2
                    },
                    type: "wall"
                },
            ]
        };
    }

    rows20cols10andSandInThe5x5():Level {
        return {
            objects: [
                {
                    position: {
                        x: 0,
                        y: 0
                    },
                    type: null
                },
                {
                    position: {
                        x: 20,
                        y: 10
                    },
                    type: null
                },
                {
                    position: {
                        x: 5,
                        y: 5
                    },
                    type: "world-object-sand"
                }
            ]
        };
    }
}
