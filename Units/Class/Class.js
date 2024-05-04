// 25.09.2019; 01.04.2024


export class Class {
    static _class__copy(TargetClass, SourceClass) {
        let propertyDescriptors = Object.getOwnPropertyDescriptors(SourceClass.prototype);
        let propertyDescriptors_static = Object.getOwnPropertyDescriptors(SourceClass);
        delete propertyDescriptors_static.prototype;

        Object.defineProperties(TargetClass, propertyDescriptors_static);
        Object.defineProperties(TargetClass.prototype, propertyDescriptors);
    }

    static _inheritanceChain__get(Class, classes_count = 1) {
        let inheritanceChain = [];

        while (Class.prototype && inheritanceChain.length < classes_count) {
            inheritanceChain.push(Class);
            Class = Object.getPrototypeOf(Class);
        }

        inheritanceChain.reverse();

        return inheritanceChain;
    }


    static mix(Class, ...mixins) {
        for (let mixin of mixins) {
            mixin = mixin instanceof Array ? mixin : [mixin];

            let mixin_inheritanceChain = this._inheritanceChain__get(...mixin);

            for (let ChainClass of mixin_inheritanceChain) {
                Class = class Mixin extends Class {};
                this._class__copy(Class, ChainClass);
            }
        }

        return Class;
    }
}
