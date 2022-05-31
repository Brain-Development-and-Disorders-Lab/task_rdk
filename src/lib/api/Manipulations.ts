/**
 * Class that links to the Gorilla Manipulations API. It allows safe references
 * to the API while developing the tasks locally.
 */
export class Manipulations {
  // Target object containing the manipulations
  private _target: any;
  // List of manipulation keys
  private _manipulations: string[];

  /**
   *
   * @param {any} _target target object containing the manipulations
   * @param {string[]} _manipulations list of manipulation keys
   */
  constructor(_target: any, _manipulations: string[]) {
    this._manipulations = _manipulations;
    this._target = _target;
    this._connect();
  }

  /**
   * Retrieves the Gorilla instance and connects any manipulations specified
   * to the Gorilla Manipulations API.
   */
  private _connect() {
    const _gorilla: any = window["gorilla"];
    this._manipulations.forEach((_manipulationKey) => {
      this._target[_manipulationKey] = _gorilla.manipulation(_manipulationKey);
    });
  }
}
