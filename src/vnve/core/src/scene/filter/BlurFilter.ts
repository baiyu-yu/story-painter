import * as PIXI from "pixi.js";
import { Filter, copyFromJSON, copyTo, toJSON } from "./Filter";
import { uuid } from "../../util";

export class BlurFilter extends PIXI.BlurFilter implements Filter {
  public label = "";
  public name = uuid();
  public type = "BlurFilter";
  public alpha = 1;

  public clone(exact = false) {
    const cloned = new BlurFilter();

    copyTo(this, cloned, exact);
    cloned.blur = this.blur;
    cloned.quality = this.quality;
    cloned.alpha = this.alpha;

    return cloned;
  }

  public toJSON() {
    return {
      ...toJSON(this),
      blur: this.blur,
      quality: this.quality,
    };
  }

  static fromJSON(json: AnyJSON) {
    const filter = new BlurFilter();

    copyFromJSON(json, filter);
    filter.blur = json.blur;
    filter.quality = json.quality;

    return filter;
  }
}
