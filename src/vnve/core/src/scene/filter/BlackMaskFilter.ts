import * as PIXI from "pixi.js";
import { Filter, copyFromJSON, copyTo, toJSON } from "./Filter";
import { uuid } from "../../util";

export class BlackMaskFilter extends PIXI.ColorMatrixFilter implements Filter {
  public label = "";
  public name = uuid();
  public type = "BlackMaskFilter";

  constructor() {
    super();
    this.blackAndWhite(true);
    this.brightness(0, true);
  }

  public clone(exact = false) {
    const cloned = new BlackMaskFilter();

    copyTo(this, cloned, exact);
    cloned.matrix = [...this.matrix] as any;
    cloned.alpha = this.alpha;

    return cloned;
  }

  public toJSON() {
    return {
      ...toJSON(this),
      matrix: Array.from(this.matrix),
    };
  }

  static fromJSON(json: AnyJSON) {
    const filter = new BlackMaskFilter();

    copyFromJSON(json, filter);
    if (json.matrix) {
      filter.matrix = json.matrix as any;
    }

    return filter;
  }
}
