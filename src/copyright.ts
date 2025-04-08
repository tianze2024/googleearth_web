// @ts-ignore
const name = `${NAME_}/${__webpack_runtime_id__}` ?? '-';
// @ts-ignore
const version = VERSION_ ?? '-';
// @ts-ignore
const date = DATE_ ?? '-';
// @ts-ignore
const owner = OWNER_ ?? '-';
// @ts-ignore
const ownerlink = OWNERLINK_ ?? '-';
// @ts-ignore
const homepage = HOMEPAGE_ ?? '-';
// @ts-ignore
const description = DESCRIPTION_ ?? '';
// @ts-ignore
const commitId = COMMITID_ ?? '';

// const qrcodeImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV4AAAFeCAMAAAD69YcoAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDQ4OCwgMjAyMC8wNy8xMC0yMjowNjo1MyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk0NjI0RDE2MzVBMDExRURBMTc4QzgxRUMzODY1RDI3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk0NjI0RDE3MzVBMDExRURBMTc4QzgxRUMzODY1RDI3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OTQ2MjREMTQzNUEwMTFFREExNzhDODFFQzM4NjVEMjciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OTQ2MjREMTUzNUEwMTFFREExNzhDODFFQzM4NjVEMjciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6CvLe7AAAADFBMVEX///+ZzJkzzDMAAACFdrApAAAEyklEQVR42uzd0XLbIBAF0GD//z932odOp5EVViwI0LlPGceylBPHuxAkfX2JiIiIiIjIEnmnhMEHA7yL8R7t7Pyxo68+H2stF168ePHixYtXY6bvxXv00i2HtQtv+rZ4F+ONF6Da0na+beyo8eLFixcvXrwaM30v3trB3868SQZ4F+M9LzvnBS2jUMVfGS9evHjx4sWrMdP34sWL9+m8LQtFWpal1E2T4sWLFy9evHg1ZvpevHjxPvN/bS3lLmeRSd138eLFixcvXrwaM33vM3lbDmsX3qRt8W7AG50irF9u0jKFiRcvXrx48eLVmOl7n8jbkl140w3wbn+hrbsfw4sXL168ePFqzPS9+/OKyNU/yZ8LUMufXnwiFC9evHjx4sUrIiLzlpjaAtRvYUfLaQA5Jx3kHAtevHjx4sW7L6+IiMw2khsxpRcvXvHy1HLid3oZw4sXL168eDfjFRGRUSO0nCIXL0o5y0ji04s5x5w+34sXL168ePFOzSsiInOM3+6a+ouX1BF7y9kvXrx48eLFuxuviIjcOWqLl5h+RbN2b2OXh1woaHjx4sWL9xG86ZV5Yl4RieWVEo54rxe52m078qb0FbXFEC9evHjx4sWrMdP34sWL984RWvZM7cfX61Lamo+qd5eAFy9evHifzVv+ZFnemRuz8u8Ti743k7d8f27Bm8Wb8Wz5qn7rnr6BFxi19Tt5+2wZSVgrbUIy++TyZXjj73e89bwXPk/wVvOWn3gL3gbeK+UQby3vpXZjWt7pGrNuG+l7az55Dz99OVby9twK7268OReZuniS93eoUnfUpaq0jfg58OLFi/c5vC+8l3hfH9+ja/JO3ZhFeCU+avsAaNSWNOdw/ijeMO9/xe33GodSfprwXWDUlnPG+W3zveFj7nf71LV5C96OvOWF9zpvuaCLN+ufQeWFt4G3XNGdl3ep6fRijVkObzl4HxcLUDMGxX9XS/87nCjW96aM2g6W7Wx2Xlt2uTt7vTHnVrwHfBcvXrx48eJ9Au8CjZnrOeDFi/cRVyMZeePOnrx33aYHL168ePHi3ZdXY6bvxSsy76gtZ6qu401twhOmQ+5VdCvvO+/XjxcvXrx48YqIyASjtpxLS+XcPqbfmLPXzXnw4sWLFy/eZ/CKiMido7aWwtdv2rDlmFsKeLwhwIsXL168eJ/AKyIic4zacj6uc08SyJrqjO+tqSzixYsXL168m/GKyEpdfiTMZubNOZk5XiqzpyvrnpfFe6FzwIsXL168eLfg1Zjpe/GuxpvzPNmLN+dDP+eizd+/auOdoKDhxYsXL168m/FqzPCO4n2nZG3e2sfw7s/bb3FGxuu18YZLG168ePHixYtXY6bvnY537LaPGxTjXYK336L5jMt/XeFt2C9evHjx4sWLV2Om752Yt3YAvDbvkAE/3sV4Wy6C1augHZW2IYv/8eLFixcvXrwaM30v3icE72K88UUhOYtHwmUnfakKXrx48eLFi1djpu/Fixfv+rwtBS1enlpKW8pyGLx48eLFixevxkzfOzHviG3x4p2bN2d6MV4qR5SxhtKGFy9evHjx4hW8t/I+42IvePGe8eYs+8ieuKzdoqXM4sWLFy9evHg1ZnhFREREREREqvNLgAEAN/BaxPYx8fMAAAAASUVORK5CYII=`;
// const qrcodeCss = `
//     background: url(${qrcodeImage}) no-repeat;
//     background-size: 160px;
//     padding: 80px;
// `

// @ts-ignore
const timestamp = TIMESTAMP_ ?? '';
const leftoverHoursStr = ((Date.now() - timestamp) / 3600000).toFixed(1);

const info = `%c🌏 ${name}%c ${version}.${commitId.slice(0, 8)}.${date} (距今${leftoverHoursStr}个小时)
%c${description ? description + '\n' : ''}当前网站正在使用${name}，此软件版权归${owner}所有
`
// %c `
// 网址：${homepage} | 微信：${ownerlink}

export const copyright = Object.seal({
    // @ts-ignore
    get owner() { return OWNER_ },
    // @ts-ignore
    get ownerlink() { return OWNERLINK_ },
    // @ts-ignore
    get gituri() { return GITURI_ && GITURI_.replace('${commitId}', COMMITID_) },
    // @ts-ignore
    get info() { return info; },
    // @ts-ignore
    get date() { return DATE_; },
    // @ts-ignore
    get author() { return AUTHOR_; },
    // @ts-ignore
    get version() { return VERSION_; },
    // @ts-ignore
    get name() { return NAME_; },
    // @ts-ignore
    get commitId() { return COMMITID_; },
    print() {
        console.info(this.info, `
            font-size: 18px;
            font-weight: 1000;
            line-height: 1;
            color: rgb(0, 120, 215);
            padding-top: 20px;
            padding-bottom: 10px;
            `,
            `
            font-size: 10px;
            font-weight: 1000;
            color: rgb(0, 120, 215);
            `,
            `
            font-size: 10px;
            line-height: 1.5;
            color: rgb(0, 120, 215);
            padding-bottom: 2px;
            padding-left: 35px;
            `,
            // qrcodeCss,
        );
    },
});

// @ts-ignore
window.g_xe2CopyRights = window.g_xe2CopyRights || {};
// @ts-ignore
window.g_xe2CopyRights[name] = copyright;
// copyright.print();