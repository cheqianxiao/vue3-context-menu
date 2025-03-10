import { defineComponent, toRefs, VNode } from "vue";
import { MenuConstOptions, MenuOptions } from "./ContextMenuDefine";

export function getTop(e: HTMLElement, stopNode?: HTMLElement): number {
  let offset = e.offsetTop;
  if (e.offsetParent != null && e.offsetParent != stopNode) {
    offset -= e.offsetParent.scrollTop;
    offset += getTop(e.offsetParent as HTMLElement, stopNode);
  }
  return offset;
}
export function getLeft(e: HTMLElement, stopNode?: HTMLElement): number {
  let offset = e.offsetLeft;
  if (e.offsetParent != null && e.offsetParent != stopNode) {
    offset -= e.offsetParent.scrollLeft;
    offset += getLeft(e.offsetParent as HTMLElement, stopNode);
  }
  return offset;
}

/**
 * If your `body` element is in a scaled state (e.g. `transform: scale(0.5)`), 
 * this may lead to the wrong position of the menu display. 
 * You can use this function to transform the menu display position:
 * 
 * ```ts
 * 
  import ContextMenu from '@imengyu/vue3-context-menu'

  function onContextMenu(e: MouseEvent) {
    const scaledPosition = ContextMenu.transformMenuPosition(e.target as HTMLElement, e.offsetX, e.offsetY);
    //Full code of menuData is in `/examples/views/InScaledBody.vue`
    menuData.x = scaledPosition.x;
    menuData.y = scaledPosition.y;
    //show menu
    ContextMenu.showContextMenu(menuData);
  }
  * ```
  * @param e Current click element
  * @param offsetX MouseEvent.offsetX
  * @param offsetY MouseEvent.offsetY
  */
export function transformMenuPosition(e: HTMLElement, offsetX: number, offsetY: number, container?: HTMLElement): {
  x: number,
  y: number,
} {
  return {
    x: getLeft(e, container) + offsetX,
    y: getTop(e, container) + offsetY,
  };
}


export function removeContainer(container: HTMLElement) :void {
  container.parentNode?.removeChild(container);
}

const DEFAULT_CONTAINER_ID = 'mx-menu-default-container';
const GEN_CONTAINER_ID = 'mx-menu-container-';
let containerId = 0;

export function genContainer(options: MenuOptions) : {
  eleId: string,
  container: HTMLElement,
  isNew: boolean,
} {
  const { getContainer, zIndex } = options;

  if (getContainer) {
    const container = typeof getContainer === 'function' ? getContainer() : getContainer;
    if (container) {
      let eleId = container.getAttribute('id');
      if (!eleId) {
        eleId = GEN_CONTAINER_ID + (containerId++);
        container.setAttribute('id', eleId);
      }
      container.style.zIndex = zIndex?.toString() || MenuConstOptions.defaultZindex.toString();
      return {
        eleId,
        container,
        isNew: false,
      };
    }
  }

  let container = document.getElementById(DEFAULT_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.setAttribute('id', DEFAULT_CONTAINER_ID);
    container.setAttribute('class', 'mx-menu-ghost-host fullscreen');
    document.body.appendChild(container);
  }
  container.style.zIndex = zIndex?.toString() || MenuConstOptions.defaultZindex.toString();
  return {
    eleId: DEFAULT_CONTAINER_ID,
    container,
    isNew: true,
  };
}

export function solveNumberOrStringSize(value: string|number) : string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Render a VNode
 */
export const VNodeRender = defineComponent({
  props: {
    vnode: {
      type: [ Object, Function ],
      default: null,
    },
    data: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const { vnode, data } = toRefs(props);
    return () => typeof vnode.value === 'function' ? (vnode.value as unknown as (data: unknown) => VNode)(data.value) : vnode.value as unknown as VNode;
  },
})