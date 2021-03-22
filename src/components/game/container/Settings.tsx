import React, { FC, useState } from 'react';
import Simulation from '../../../simulation';
import { SimulationSettings } from '../../../simulation/state';
import { SimulationEventType } from '../../../simulation/system/event';
import { mergeDeep } from '../../../util/data-access';
import { Watcher } from '../hud/Watcher';

export const Settings: FC = () => {
  const [localSettings, setLocalSettings] = useState({...Simulation.settings});
  const setSettings = (settings: Partial<SimulationSettings>) => {
    mergeDeep(Simulation.settings, settings);
    setLocalSettings({...Simulation.settings});
  };
  return <div className={'interface'}>
    <h1>Settings</h1>
    <Watcher/>
    <label>Simulation Speed:</label>
    <input type='range' list={'tick-list'} min='100' max={'2000'} step={'100'} defaultValue={localSettings.timeMultiplier + ''} onChange={e => setSettings({timeMultiplier: parseInt(e.target.value, 10)})}/>
    <datalist id={'tick-list'}>
      <option value={'100'} label={'100x'}/>
      <option value={'200'}/>
      <option value={'300'}/>
      <option value={'400'}/>
      <option value={'500'}/>
      <option value={'600'}/>
      <option value={'700'}/>
      <option value={'800'}/>
      <option value={'900'}/>
      <option value={'1000'} label={'1000x'}/>
      <option value={'1100'}/>
      <option value={'1200'}/>
      <option value={'1300'}/>
      <option value={'1400'}/>
      <option value={'1500'}/>
      <option value={'1600'}/>
      <option value={'1700'}/>
      <option value={'1800'}/>
      <option value={'1900'}/>
      <option value={'2000'} label={'2000x'}/>
    </datalist>
    <span>{localSettings.timeMultiplier + 'x'}</span>
    <br/>
    <button onClick={() => Simulation.event({
      type: SimulationEventType.Notify,
      sub: 'system',
      data: 'padding notes go here',
    })}>Add Note
    </button>
    <br/>
    <button onClick={() => Simulation.event({type: SimulationEventType.Save})}>Save Game</button>
    <button onClick={() => Simulation.event({type: SimulationEventType.Load})}>Load Game</button>
  </div>;
};
