import { BehaviorSubject, Subject } from "rxjs";
import { pluck, scan, distinctUntilChanged } from "rxjs/operators"

export class ObservableStore{

    constructor(initialState){
        this._store = new BehaviorSubject(initialState);
        this._stateUpdates = new Subject(); 

        //Accumulate state
        this._stateUpdates.pipe(
                                scan((prev, next)=>{
                                    return {...prev, ...next}
                                }, initialState)).subscribe(this._store);

    }

    updateState(stateUpdate){
        this._stateUpdates.next(stateUpdate);
    }

    selectState(stateKey){
        return this._store.pipe(distinctUntilChanged(stateKey), pluck(stateKey))
    }

    stateChanges(){
        return this._store.asObservable();
    }
}