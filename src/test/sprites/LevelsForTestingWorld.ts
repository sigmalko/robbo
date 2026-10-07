import type { Level, LevelProvider } from "../../main/levels/LevelProvider";

export class LevelsForTestingWorld implements LevelProvider {
    downloadLevel(id:number):Level {
        return this.emptyLevel();
    }

    emptyLevel():Level {
        return {
            objects: [

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





    rows30cols15blankAndOneRobboAndThreeSands():Level {
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
                        x: 30,
                        y: 15
                    },
                    type: null
                },
                {
                    position: {
                        x: 3,
                        y: 3
                    },
                    type: "world-object-sand"
                },
                {
                    position: {
                        x: 4,
                        y: 3
                    },
                    type: "world-object-sand"
                },
                {
                    position: {
                        x: 5,
                        y: 3
                    },
                    type: "world-object-sand"
                },
                {
                    position: {
                        x: 10,
                        y: 10
                    },
                    type: "world-object-robbo"
                }
            ]
        };
    }

}
