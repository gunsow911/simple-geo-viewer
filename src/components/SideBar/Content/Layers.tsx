import React, { Dispatch, FC, SetStateAction, useCallback, useContext, useEffect } from 'react';
import { context } from '@/pages';
import { Data, Menu } from '@/components/LayerFilter/menu';
import { getResourceIcon } from '@/components/SideBar/Icon';
import {
  filterCheckedData,
  getCheckedLayerIdByDataTitleList,
} from '@/components/LayerFilter/sideBar';
import { DownloadIcon } from '@/components/SideBar/Icon';
import { useRecoilState } from 'recoil';
import { LayersState, TemporalLayerConfigState } from '@/store/LayersState';
import { makeDeckGLLayer } from '@/components/Map/Layer/deckGlLayerFactory';
import { TEMPORAL_LAYER_TYPES } from '@/components/Map/Layer/temporalLayerMaker';
import { getLayerConfigById, LayerConfig } from '@/components/LayerFilter/config';
import { TooltipDataState, TooltipPositionState } from '@/store/TooltipState';

const isSelected = (resourceName: string, selectedResourceNameList: string[]): boolean => {
  return selectedResourceNameList.includes(resourceName);
};

const setResourceViewState = (resource: Data, setClickedLayerViewState: any) => {
  setClickedLayerViewState({
    longitude: resource.lng,
    latitude: resource.lat,
    zoom: resource.zoom,
    id: resource.id[0],
  });
};

type LayersProps = {
  layers: Data[];
};

export const Layers: FC<LayersProps> = ({ layers }) => {
  const {
    checkedLayerTitleList,
    setCheckedLayerTitleList,
    setClickedLayerViewState,
    setMouseTooltipData,
    preferences,
  } = useContext(context);

  const [deckGLLayers, setDeckGLLayers] = useRecoilState(LayersState);
  const [temporalLayerConfigs, setTemporalLayerConfigs] = useRecoilState(TemporalLayerConfigState);
  const [tooltipData, setTooltipData] = useRecoilState(TooltipDataState);
  const [tooltipPosition, setTooltipPosition] = useRecoilState(TooltipPositionState);

  const layerCreateById = useCallback(
    (ids: string[]) => {
      return ids.forEach((id) => {
        const layerConfig = getLayerConfigById(id, preferences.config);
        if (!layerConfig) {
          return;
        }
        if (TEMPORAL_LAYER_TYPES.includes(layerConfig.type)) {
          setTemporalLayerConfigs((currVal) => {
            return [...currVal, layerConfig];
          });
        } else {
          const deckGLlayer = makeDeckGLLayer(layerConfig, setTooltipData, setTooltipPosition);
          if (deckGLlayer) {
            setDeckGLLayers((currVal) => {
              return [...currVal, deckGLlayer];
            });
          }
        }
      });
    },
    [
      preferences.config,
      setTemporalLayerConfigs,
      setTooltipData,
      setTooltipPosition,
      setDeckGLLayers,
    ]
  );

  //最初の一度だけ、menuのcheckedを確認し、trueならcheckedLayerTitleListにset
  useEffect(() => {
    layers
      .filter((value) => value.checked)
      .forEach((value) => {
        layerCreateById(value.id);
      });
  }, []);

  const toggleSelectedResourceList = (resource: Data) => {
    // 既存のリストに対象リソースが入っていなければ格納
    if (!isSelected(resource.title, checkedLayerTitleList)) {
      setCheckedLayerTitleList((prevList) => [...prevList, resource.title]);
      // クリックされたリソースの位置情報を保存する
      setResourceViewState(resource, setClickedLayerViewState);

      layerCreateById(resource.id);

      return;
    }

    //リストから削除
    const newList = checkedLayerTitleList.filter((item) => {
      return item !== resource.title;
    });
    resource.id.forEach((id) => {
      const layerConfig = getLayerConfigById(id, preferences.config);
      if (!layerConfig) {
        return;
      }
      if (TEMPORAL_LAYER_TYPES.includes(layerConfig.type)) {
        setTemporalLayerConfigs((currVal) => {
          return currVal.filter((value) => {
            return layerConfig.id !== value.id;
          });
        });
      } else {
        setDeckGLLayers((currVal) => {
          return currVal.filter((value) => {
            return id !== value.id;
          });
        });
      }
    });
    setCheckedLayerTitleList([...newList]);
    //チェックが外れた時はnullをセットしてflyToしない
    setClickedLayerViewState(null);
  };

  const resourceStyle = {
    fontSize: '0.75rem',
  };

  const textStyle = {
    overflow: 'hidden',
    'text-overflow': 'ellipsis',
    'white-space': 'nowrap',
    'min-width': 0,
  };
  return (
    <>
      {layers.map((resource, index) => (
        <label key={resource.title}>
          <div
            className="transition-hover duration-500 ease bg-white hover:bg-gray-200 p-2 flex"
            style={resourceStyle}
            key={index}
          >
            <div className="w-11/12 pr-3 flex items-center">
              <input
                type="checkbox"
                className="rounded-full mx-1 text-cyan-600 focus:outline-none min-w-16 min-h-16 max-w-16 max-h-16"
                checked={isSelected(resource.title, checkedLayerTitleList)}
                onChange={() => {
                  toggleSelectedResourceList(resource);
                }}
              />
              {getResourceIcon(resource, preferences.config)}
              <p
                onMouseOver={(event) =>
                  setMouseTooltipData(() => ({
                    text: resource.title,
                    top: (window.innerHeight - event.clientY + 10) * -1,
                    left: 20,
                  }))
                }
                onMouseOut={() => setMouseTooltipData(() => null)}
                style={textStyle}
              >
                {resource.title}
              </p>
            </div>
            <div className="w-1/12">
              {resource.download_url === undefined
                ? undefined
                : DownloadIcon(resource.download_url)}
            </div>
          </div>
        </label>
      ))}
    </>
  );
};
