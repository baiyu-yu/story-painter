import { OldFilmFilter as RawOldFilmFilter } from "@pixi/filter-old-film";
import { Filter, copyFromJSON, copyTo, toJSON } from "./Filter";
import { uuid } from "../../util";

export class OldFilmFilter extends RawOldFilmFilter implements Filter {
  public label = "";
  public name = uuid();
  public type = "OldFilmFilter";
  public alpha = 1;

  public clone(exact = false) {
    const cloned = new OldFilmFilter();

    copyTo(this, cloned, exact);
    cloned.sepia = this.sepia;
    cloned.noise = this.noise;
    cloned.noiseSize = this.noiseSize;
    cloned.scratch = this.scratch;
    cloned.scratchDensity = this.scratchDensity;
    cloned.scratchWidth = this.scratchWidth;
    cloned.vignetting = this.vignetting;
    cloned.vignettingAlpha = this.vignettingAlpha;
    cloned.vignettingBlur = this.vignettingBlur;
    cloned.alpha = this.alpha;

    return cloned;
  }

  public toJSON() {
    return {
      ...toJSON(this),
      sepia: this.sepia,
      noise: this.noise,
      noiseSize: this.noiseSize,
      scratch: this.scratch,
      scratchDensity: this.scratchDensity,
      scratchWidth: this.scratchWidth,
      vignetting: this.vignetting,
      vignettingAlpha: this.vignettingAlpha,
      vignettingBlur: this.vignettingBlur,
    };
  }

  static fromJSON(json: AnyJSON) {
    const filter = new OldFilmFilter();

    copyFromJSON(json, filter);
    filter.sepia = json.sepia;
    filter.noise = json.noise;
    filter.noiseSize = json.noiseSize;
    filter.scratch = json.scratch;
    filter.scratchDensity = json.scratchDensity;
    filter.scratchWidth = json.scratchWidth;
    filter.vignetting = json.vignetting;
    filter.vignettingAlpha = json.vignettingAlpha;
    filter.vignettingBlur = json.vignettingBlur;

    return filter;
  }
}
