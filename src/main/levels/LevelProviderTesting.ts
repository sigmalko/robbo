import type { Level, LevelProvider } from "./LevelProvider";

export class LevelProviderTesting implements LevelProvider {
    downloadLevel(id:number):Level {
        switch(id) {
            case 1:
                return this.rows3cols3easy();
            case 2:
                return this.rows30cols15blank();
            case 3:
                return this.rows30cols15manyWallsAndStones();
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
                }
            ]
        };
    }

    rows30cols15blank():Level {
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


    rows30cols15manyWallsAndStones():Level {
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
                        x: 0,
                        y: 0
                    },
                    type: "world-object-wall-gray"
                },
                {
                    position: {
                        x: 0,
                        y: 1
                    },
                    type: "world-object-wall-gray"
                },
                {
                    position: {
                        x: 0,
                        y: 2
                    },
                    type: "world-object-wall-gray"
                },
                {
                    position: {
                        x: 0,
                        y: 3
                    },
                    type: "world-object-wall-red"
                },
                {
                    position: {
                        x: 0,
                        y: 4
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 1,
                        y: 4
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 1,
                        y: 5
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 1,
                        y: 6
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 0,
                        y: 6
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 0,
                        y: 7
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 0,
                        y: 8
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 0,
                        y: 9
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 0,
                        y: 10
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 0,
                        y: 11
                    },
                    type: "world-object-stones-yellow"
                },
                {
                    position: {
                        x: 0,
                        y: 12
                    },
                    type: "world-object-stones-yellow"
                },
                {
                    position: {
                        x: 0,
                        y: 13
                    },
                    type: "world-object-stones-yellow"
                },
                {
                    position: {
                        x: 0,
                        y: 14
                    },
                    type: "world-object-stones-pink"
                },
                {
                    position: {
                        x: 0,
                        y: 15
                    },
                    type: "world-object-stones-pink"
                },

                {
                    position: {
                        x: 1,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 2,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 3,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 4,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },


                {
                    position: {
                        x: 5,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },


                {
                    position: {
                        x: 6,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 7,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 8,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 9,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 10,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },


                {
                    position: {
                        x: 20,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },
                {
                    position: {
                        x: 19,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },

                {
                    position: {
                        x: 18,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },

                {
                    position: {
                        x: 17,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },

                {
                    position: {
                        x: 16,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },


                {
                    position: {
                        x: 21,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },


                {
                    position: {
                        x: 22,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },



                {
                    position: {
                        x: 23,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },


                {
                    position: {
                        x: 24,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },


                {
                    position: {
                        x: 25,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },



                {
                    position: {
                        x: 26,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },


                {
                    position: {
                        x: 27,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },


                {
                    position: {
                        x: 28,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },


                {
                    position: {
                        x: 29,
                        y: 0
                    },
                    type: "world-object-wall-red"
                },

                {
                    position: {
                        x: 29,
                        y: 15
                    },
                    type: "world-object-wall-black"
                },


                {
                    position: {
                        x: 28,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },


                {
                    position: {
                        x: 27,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },

                {
                    position: {
                        x: 26,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },


                {
                    position: {
                        x: 25,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },


                {
                    position: {
                        x: 24,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },

                {
                    position: {
                        x: 23,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },

                {
                    position: {
                        x: 22,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },


                {
                    position: {
                        x: 21,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },

                {
                    position: {
                        x: 20,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },


                {
                    position: {
                        x: 19,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },

                {
                    position: {
                        x: 18,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },

                {
                    position: {
                        x: 17,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },

                {
                    position: {
                        x: 16,
                        y: 15
                    },
                    type: "world-object-wall-gray"
                },





                {
                    position: {
                        x: 11,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 12,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 13,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 14,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 15,
                        y: 15
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 1,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 2,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 3,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 4,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },


                {
                    position: {
                        x: 5,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },


                {
                    position: {
                        x: 6,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 7,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 8,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 9,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 10,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 11,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 12,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },
                {
                    position: {
                        x: 13,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 14,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },

                {
                    position: {
                        x: 15,
                        y: 0
                    },
                    type: "world-object-wall-green"
                },



                {
                    position: {
                        x: 30,
                        y: 15
                    },
                    type: "world-object-stones-red"
                },

                {
                    position: {
                        x: 30,
                        y: 14
                    },
                    type: "world-object-stones-red"
                },
                {
                    position: {
                        x: 30,
                        y: 13
                    },
                    type: "world-object-stones-red"
                },


                {
                    position: {
                        x: 30,
                        y: 12
                    },
                    type: "world-object-stones-red"
                },

                {
                    position: {
                        x: 30,
                        y: 11
                    },
                    type: "world-object-stones-red"
                },

                {
                    position: {
                        x: 30,
                        y: 10
                    },
                    type: "world-object-stones-red"
                },

                {
                    position: {
                        x: 30,
                        y: 9
                    },
                    type: "world-object-stones-blue"
                },

                {
                    position: {
                        x: 30,
                        y: 8
                    },
                    type: "world-object-stones-blue"
                },

                {
                    position: {
                        x: 30,
                        y: 7
                    },
                    type: "world-object-stones-blue"
                },

                {
                    position: {
                        x: 30,
                        y: 6
                    },
                    type: "world-object-stones-blue"
                },

                {
                    position: {
                        x: 30,
                        y: 5
                    },
                    type: "world-object-stones-blue"
                },

                {
                    position: {
                        x: 30,
                        y: 4
                    },
                    type: "world-object-stones-blue"
                },


                {
                    position: {
                        x: 30,
                        y: 3
                    },
                    type: "world-object-stones-orange"
                },

                {
                    position: {
                        x: 30,
                        y: 2
                    },
                    type: "world-object-stones-orange"
                },

                {
                    position: {
                        x: 30,
                        y: 1
                    },
                    type: "world-object-stones-orange"
                },

                {
                    position: {
                        x: 30,
                        y: 0
                    },
                    type: "world-object-stones-orange"
                },


                {
                    position: {
                        x: 15,
                        y: 15
                    },
                    type: "world-object-stones-orange"
                },
                {
                    position: {
                        x: 11,
                        y: 10
                    },
                    type: "world-object-stones-orange"
                },

                {
                    position: {
                        x: 11,
                        y: 11
                    },
                    type: "world-object-stones-orange"
                },

                {
                    position: {
                        x: 11,
                        y: 12
                    },
                    type: "world-object-stones-orange"
                },


                {
                    position: {
                        x: 11,
                        y: 13
                    },
                    type: "world-object-stones-orange"
                },
                {
                    position: {
                        x: 12,
                        y: 10
                    },
                    type: "world-object-stones-orange"
                },
                {
                    position: {
                        x: 13,
                        y: 10
                    },
                    type: "world-object-stones-orange"
                },
                {
                    position: {
                        x: 14,
                        y: 10
                    },
                    type: "world-object-stones-orange"
                },
                {
                    position: {
                        x: 15,
                        y: 10
                    },
                    type: "world-object-stones-orange"
                },
                {
                    position: {
                        x: 29,
                        y: 14
                    },
                    type: "world-object-stones-orange"
                },


                {
                    position: {
                        x: 0,
                        y: 5
                    },
                    type: "world-object-wall-black"
                },
                {
                    position: {
                        x: 10,
                        y: 10
                    },
                    type: "world-object-robbo"
                },
                {
                    position: {
                        x: 5,
                        y: 4
                    },
                    type: "world-object-enemy-bird",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },
                {
                    position: {
                        x: 24,
                        y: 7
                    },
                    type: "world-object-enemy-bird",
                    params: [
                        {
                            name: "direction",
                            value: "LEFT"
                        }
                    ]
                },
                {
                    position: {
                        x: 3,
                        y: 1
                    },
                    type: "world-object-enemy-bird",
                    params: [
                        {
                            name: "direction",
                            value: "DOWN"
                        }
                    ]
                },
                {
                    position: {
                        x: 3,
                        y: 2
                    },
                    type: "world-object-enemy-bird",
                    params: [
                        {
                            name: "direction",
                            value: "DOWN"
                        }
                    ]
                },
                {
                    position: {
                        x: 7,
                        y: 2
                    },
                    type: "world-object-enemy-bird",
                    params: [
                        {
                            name: "direction",
                            value: "DOWN"
                        }
                    ]
                },


                {
                    position: {
                        x: 14,
                        y: 13
                    },
                    type: "world-object-enemy-bird",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },

                {
                    position: {
                        x: 12,
                        y: 11
                    },
                    type: "world-object-enemy-bear",
                    params: [
                        {
                            name: "direction",
                            value: "UP"
                        }
                    ]
                },

                {
                    position: {
                        x: 20,
                        y: 14
                    },
                    type: "world-object-enemy-worm",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },

                {
                    position: {
                        x: 1,
                        y: 1
                    },
                    type: "world-object-enemy-eye"
                },

                {
                    position: {
                        x: 5,
                        y: 14
                    },
                    type: "world-object-cannon-walking",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        },
                        {
                            name: "firingDirection",
                            value: "UP"
                        }
                    ]
                },

                {
                    position: {
                        x: 10,
                        y: 3
                    },
                    type: "world-object-cannon-walking",
                    params: [
                        {
                            name: "direction",
                            value: "LEFT"
                        },
                        {
                            name: "firingDirection",
                            value: "DOWN"
                        }
                    ]
                },
                {
                    position: {
                        x: 1,
                        y: 7
                    },
                    type: "world-object-enemy-magnet",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },
                {
                    position: {
                        x: 20,
                        y: 5
                    },
                    type: "world-object-enemy-barrier",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },
                {
                    position: {
                        x: 21,
                        y: 5
                    },
                    type: "world-object-enemy-barrier",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },
                {
                    position: {
                        x: 22,
                        y: 5
                    },
                    type: "world-object-enemy-barrier",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },
                {
                    position: {
                        x: 23,
                        y: 5
                    },
                    type: "world-object-enemy-barrier",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },
                {
                    position: {
                        x: 28,
                        y: 5
                    },
                    type: "world-object-enemy-barrier",
                    params: [
                        {
                            name: "direction",
                            value: "RIGHT"
                        }
                    ]
                },
                {
                    position: {
                        x: 15,
                        y: 2
                    },
                    type: "world-object-box"
                },
                {
                    position: {
                        x: 4,
                        y: 12
                    },
                    type: "world-object-box"
                },
                {
                    position: {
                        x: 20,
                        y: 2
                    },
                    type: "world-object-enemy-danger-box"
                },
                {
                    position: {
                        x: 20,
                        y: 8
                    },
                    type: "world-object-door-key"
                },
                {
                    position: {
                        x: 13,
                        y: 11
                    },
                    type: "world-object-door-key"
                },
                {
                    position: {
                        x: 12,
                        y: 9
                    },
                    type: "world-object-door"
                },
                {
                    position: {
                        x: 12,
                        y: 8
                    },
                    type: "world-object-wall-gray"
                },
                {
                    position: {
                        x: 11,
                        y: 8
                    },
                    type: "world-object-wall-gray"
                },
                {
                    position: {
                        x: 10,
                        y: 8
                    },
                    type: "world-object-wall-gray"
                },
                {
                    position: {
                        x: 13,
                        y: 8
                    },
                    type: "world-object-wall-gray"
                },
                {
                    position: {
                        x: 14,
                        y: 8
                    },
                    type: "world-object-wall-gray"
                },
                {
                    position: {
                        x: 20,
                        y: 11
                    },
                    type: "world-object-plane-screw"
                },
                {
                    position: {
                        x: 1,
                        y: 13
                    },
                    type: "world-object-plane-screw"
                },
                {
                    position: {
                        x: 12,
                        y: 6
                    },
                    type: "world-object-plane-screw"
                },
                {
                    position: {
                        x: 5,
                        y: 2
                    },
                    type: "world-object-plane"
                },
                {
                    position: {
                        x: 1,
                        y: 10
                    },
                    type: "world-object-ammunition"
                },
                {
                    position: {
                        x: 7,
                        y: 12
                    },
                    type: "world-object-enemy-bomb"
                },
                {
                    position: {
                        x: 7,
                        y: 14
                    },
                    type: "world-object-enemy-bomb"
                },
                {
                    position: {
                        x: 8,
                        y: 14
                    },
                    type: "world-object-enemy-bomb"
                },
                {
                    position: {
                        x: 8,
                        y: 13
                    },
                    type: "world-object-enemy-bomb"
                },
                {
                    position: {
                        x: 7,
                        y: 13
                    },
                    type: "world-object-enemy-bomb"
                },
                {
                    position: {
                        x: 5,
                        y: 13
                    },
                    type: "world-object-enemy-bomb"
                },
                {
                    position: {
                        x: 6,
                        y: 13
                    },
                    type: "world-object-enemy-bomb"
                },
                {
                    position: {
                        x: 24,
                        y: 14
                    },
                    type: "world-object-question"
                },
                {
                    position: {
                        x: 28,
                        y: 2
                    },
                    type: "world-object-mirror",
                    params: [
                        {
                            name: "group",
                            value: "first"
                        }
                    ]
                },
                {
                    position: {
                        x: 5,
                        y: 10
                    },
                    type: "world-object-mirror",
                    params: [
                        {
                            name: "group",
                            value: "first"
                        }
                    ]
                }
            ]
        };
    }
}
