import React, { ReactNode, VFC, useContext } from 'react';
import { context } from '@/pages';
import Collapsible from 'react-collapsible';
import { getDataById, getCategoryById, getDataTitleById } from '@/components/LayerFilter/menu';
import { largeDownloadIcon } from '@/components/SideBar/Icon';

type BaseTooltipProps = { children: ReactNode };

const BaseTooltip: VFC<BaseTooltipProps> = ({ children }) => {
  const { preferences } = useContext(context);
  const toolChipStyle = {
    backgroundColor: preferences.settings.tooltip_background_color,
  };
  return (
    <div className="visible">
      <div id="tooltip_content" className="bg-white overflow-auto" style={toolChipStyle}>
        {children}
      </div>
    </div>
  );
};

type TooltipProps = {
  properties: any;
  labels: string[];
  tooltipType: string;
  id: string;
};

type TooltipBodyProps = {
  properties: any;
  labels: string[];
};

type TooltipThumbnailBodyProps = {
  properties: any;
  labels: string[];
  id: string;
};

type TooltipTableBodyProps = {
  properties: any;
  labels: string[];
  id: string;
};

export const Tooltip: VFC<TooltipProps> = ({ properties, labels, tooltipType, id }) => {
  return (
    <BaseTooltip>
      { (() => {
        switch (tooltipType) {
          case "default":
            return <TooltipDefaultBody {...{ properties: properties, labels: labels }}/>;
          case "thumbnail":
              return <TooltipThumbnailBody {...{ properties: properties, labels: labels, id: id }}/>;
          case "table":
              return <TooltipTableBody {...{ properties: properties, labels: labels, id: id }}/>;
          default:
            break;
        }
      })() }
    </BaseTooltip>
  );
};

const TooltipDefaultBody: VFC<TooltipBodyProps> = ({ properties, labels }) => {
  return (
    <table className="tooltip_table">
      <tbody>
        {labels.map((key) => {
          const value = String(properties[key]);
          // "画像"というkeyでかつURLを持っている場合は画像を表示する・それ以外は文字列として表示する
          let content: JSX.Element | string;
          if (key === '画像') {
            content = 'N/A';
            if (value.startsWith('http')) content = <img src={value} />; // 値がURLではない場合があるのでチェック
          } else {
            content = value;
          }

          return (
            <tr key={key}>
              <th className="tooltip_th">{key}</th>
              <td className="tooltip_td">{content}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const TooltipThumbnailBody: VFC<TooltipThumbnailBodyProps> = ({ properties, labels, id }) => {
  //todo jsonに移動
  const summaryKey = {
    title: ["話題提供者名", "タイトル","事業所名"],
    image: ["画像", "写真","サムネイル"],
    description: ["内容"]
  }

  const { preferences } = useContext(context);

  const summary = () => {
    
    const titleValue = properties[
      labels.filter((key) => { return summaryKey.title.indexOf(key) > -1 })[0]
    ];

    const imageValue = properties[
      labels.filter((key) => { return summaryKey.image.indexOf(key) > -1 })[0]
    ];

    const layerTitle = getDataTitleById(preferences.menu, id);
    const resource = getDataById(preferences.menu, [id]);


    const image = () => {
      let content: JSX.Element | string;
      content = 'N/A';
      if (imageValue.startsWith('http')) content = <img className='w-full' src={imageValue} />;
      return content;
    }

    const descriptionValue: string | undefined = properties[
      labels.filter((key) => { return summaryKey.description.indexOf(key) > -1 })[0]
    ];
    return(
      <>
        { image() }
        <div className='text-center'>{ titleValue }</div>
        <div className='text-sm text-gray-600 text-center'>{ layerTitle }</div>
        <div className='text-sm text-left'>{ typeof descriptionValue === 'string' ? descriptionValue.slice(0, 15) + "…" : '' }  </div>
        <div className='flex justify-center'>{resource.download_url === undefined ? undefined : largeDownloadIcon(resource.download_url)}</div>
      </>
    )
  }

  return (
    <>
    { summary() }
    <Collapsible trigger="詳細情報" triggerClassName="text-white bg-blue-500 rounded hover:opacity-75" triggerOpenedClassName="text-white bg-blue-500 rounded hover:opacity-75">
      <table className="tooltip_table">
        <tbody>
        {labels.map((key) => {
          const{ description, ..._summaryKey} = summaryKey
          const summaryKeys = Object.keys(_summaryKey).map((key)=>{return summaryKey[key]}).flat();
          const value = String(properties[key]);

          let content: JSX.Element | string;
          if (summaryKeys.indexOf(key) > -1) {
            return;
          } else {
            content = value;
          }

          return (
                <tr key={key}>
                  <th className="tooltip_th">{key}</th>
                  <td className="whitespace-normal tooltip_td">{content}</td>
                </tr>
          );
        })}
        </tbody>
      </table>
    </Collapsible>
    </>
  );
};

const TooltipTableBody: VFC<TooltipTableBodyProps> = ({ properties, labels, id }) => {
  //todo jsonに移動
  const summaryKey = {
    title: ["旧市区町村名"],
    dataset: [""],
    resource: [""]
  }

  const summary = () => {
    
    const { preferences } = useContext(context);
    const layerTitle = getDataTitleById(preferences.menu, id);
    const layerCategory = getCategoryById(preferences.menu, id);
  

    const titleValue = properties[
      labels.filter((key) => { return summaryKey.title.indexOf(key) > -1 })[0]
    ];
  
    return(
      <>
        <div>{ titleValue }</div>
        <div>{ layerCategory }</div>
        <div>{ layerTitle }</div>
      </>
    )
  }

  return (
    <>
    { summary() }
    <table className="tooltip_table">
      <tbody>
      {labels.map((key) => {
        const summaryKeys = Object.keys(summaryKey).map((key)=>{return summaryKey[key]}).flat();
        const value = String(properties[key]);

        let content: JSX.Element | string;
        if (summaryKeys.indexOf(key) > -1) {
          return;
        } else {
          content = value;
        }

        return (
              <tr key={key}>
                <th className="tooltip_th">{key}</th>
                <td className="tooltip_td">{content}</td>
              </tr>
        );
      })}
      </tbody>
    </table>
    </>
  );
};