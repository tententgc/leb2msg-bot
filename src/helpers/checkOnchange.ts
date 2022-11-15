const checkOnchange = (remoteJSON: any , localJSON:any) => { 
    let changed = false;
    Object.keys(localJSON).forEach((key) => {
        if (remoteJSON[key] !== localJSON[key]) {
        changed = true;
        }
    });
    return changed;
    }; 

export default checkOnchange; 