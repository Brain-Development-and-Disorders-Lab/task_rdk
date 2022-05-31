// Configuration
import { Configuration } from "../../Configuration";

/**
 * Utility class to load images and setup any API calls if required
 */
export class Stimuli {
  _collection: { [x: string]: any };
  constructor() {
    this._collection = {};
    this._load();
  }

  /**
   * Loader method for the collection of Stimuli
   */
  private _load() {
    // Populate the image collection for Gorilla
    if (Configuration.target === "gorilla") {
      // Grab the Gorilla API from the browser
      const _gorilla: any = window["gorilla"];
      const _images = {};
      // For each of the images from the desktop build, we
      // want to create a new API call to retrieve each from
      // the Gorilla platform
      Object.keys(Configuration.images.desktop).forEach((_image) => {
        // Generate the new API call
        _images[_image] = _gorilla.resourceURL(_image);
      });
      // Re-assign the images to the configuration object
      Configuration.images.gorilla = _images;
    }
    this._collection =
      Configuration.target === "gorilla"
        ? Configuration.images.gorilla
        : Configuration.images.desktop;
  }

  /**
   * Get the image collection
   * @return {{ [x: string]: any }}
   */
  get(): { [x: string]: any } {
    return this._collection;
  }
}
