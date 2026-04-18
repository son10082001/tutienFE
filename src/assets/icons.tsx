import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

import arrowLeft from './svg/arrow-left.svg';
import arrowRight from './svg/arrow-right.svg';
import arrowUp from './svg/arrow-up.svg';
import download from './svg/download.svg';
import error_circle from './svg/error-circle.svg';
import fb from './svg/fb.svg';
import file from './svg/file.svg';
import github from './svg/github.svg';
import globe from './svg/globe.svg';
import google from './svg/google.svg';
import insta from './svg/insta.svg';
import internet_white from './svg/internet-white.svg';
import internet from './svg/internet.svg';
import job from './svg/job.svg';
import linkedin2 from './svg/linkedin-community.svg';
import linkedin from './svg/linkedin.svg';
import microsoft from './svg/microsoft.svg';
import search from './svg/search.svg';
import share from './svg/share.svg';
import spotify from './svg/spotify.svg';
import star from './svg/star.svg';
import success_circle from './svg/success-circle.svg';
import window from './svg/window.svg';
import x from './svg/x.svg';
import youtube from './svg/youtube.svg';

const IconList = {
  fb,
  insta,
  youtube,
  success_circle,
  error_circle,
  spotify,
  job,
  star,
  linkedin2,
  internet_white,
  internet,
  download,
  share,
  x,
  linkedin,
  arrowLeft,
  arrowRight,
  arrowUp,
  google,
  microsoft,
  github,
  globe,
  file,
  window,
  search,
};

type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;
type ComponentAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;
interface IconProps extends ComponentAttributes {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
}

export type Icon = ForwardRefExoticComponent<IconProps>;

export const Icons = IconList as Record<keyof typeof IconList, Icon>;
