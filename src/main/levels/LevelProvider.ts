

export interface LevelProvider {
    downloadLevel(id:number):Level;
}

export interface Level {
    objects:LevelObject[];
}

export interface LevelObject {
    position:Position;
    type?:string;
    params?:LevelObjectParameters[];
}

export interface LevelObjectParameters {
    name:string;
    value:string;
}

export interface Position {
    x:number;
    y:number;
}
