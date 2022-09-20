import React, { ReactNode, VFC, useContext } from 'react';
import { context } from '@/pages';
import Collapsible from 'react-collapsible';
import { getDataById, getCategoryByTitle, getDataTitleById } from '@/components/LayerFilter/menu';
import { largeDownloadIcon, shareIcon, linkIcon } from '@/components/SideBar/Icon';

type BaseTooltipProps = { children: ReactNode };

const tdStyle = {
  paddingRight: '35px',
};

const BaseTooltip: VFC<BaseTooltipProps> = ({ children }) => {
  const { preferences } = useContext(context);
  const setTooltipPosition = {
    backgroundColor: preferences.settings.tooltip_background_color,
  };
  return (
    <div className="visible h-full">
      <div id="tooltip_content" className="bg-white h-full" style={setTooltipPosition}>
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
    <div className={'relative overflow-auto h-full '}>
      <BaseTooltip>
        {(() => {
          switch (tooltipType) {
            case 'default':
              return <TooltipDefaultBody {...{ properties: properties, labels: labels }} />;
            case 'thumbnail':
              return (
                <TooltipThumbnailBody {...{ properties: properties, labels: labels, id: id }} />
              );
            case 'table':
              return <TooltipTableBody {...{ properties: properties, labels: labels, id: id }} />;
            default:
              break;
          }
        })()}
      </BaseTooltip>
    </div>
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

          content = value;

          if (key === '画像' || key === '写真' || key === 'サムネイル') {
            content = 'N/A';
            if (value.startsWith('http')) content = <img src={value} />; // 値がURLではない場合があるのでチェック
          }
          if (key === 'URL' || key === '関連URL') {
            content = (
              <a
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                href={value}
                target="TOP"
              >
                {value}
              </a>
            );
          }
          if (key === 'HP' || key === 'YouTubeリンク') {
            content = (
              <a
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                href={value}
                target="TOP"
              >
                リンク
              </a>
            );
          }

          return (
            <tr key={key}>
              <td className="whitespace-nowrap font-bold align-top">{key}</td>
              <td className="whitespace-nomal break-all" style={tdStyle}>
                {content}
              </td>
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
    title: ['話題提供者名', 'タイトル', '事業所名'],
    image: ['画像', '写真', 'サムネイル'],
    description: ['内容'],
  };

  const { preferences } = useContext(context);

  const { description, ..._summaryKey } = summaryKey;
  const summaryKeys = Object.keys(_summaryKey)
    .map((key) => {
      return summaryKey[key];
    })
    .flat();

  const infolabels = [...labels].filter((key) => summaryKeys.indexOf(key) === -1);

  const summary = () => {
    const titleValue =
      properties[
        labels.filter((key) => {
          return summaryKey.title.indexOf(key) > -1;
        })[0]
      ];

    const imageValue =
      properties[
        labels.filter((key) => {
          return summaryKey.image.indexOf(key) > -1;
        })[0]
      ];

    const layerTitle = getDataTitleById(preferences.menu, id);
    const resource = getDataById(preferences.menu, [id]);

    const image = () => {
      let content: JSX.Element | string;
      content = 'N/A';

      if (imageValue.startsWith('http'))
        content = (
          <img
            className="w-full"
            src={imageValue}
            style={{
              objectFit: 'cover',
              objectPosition: '0% 50%',
              height: 'calc(50%)',
            }}
          />
        );
      return content;
    };

    const descriptionValue: string | undefined =
      properties[
        labels.filter((key) => {
          return summaryKey.description.indexOf(key) > -1;
        })[0]
      ];
    return (
      <>
        {image()}
        <div className="pl-2 pr-2">
          <div className="text-center font-bold">{titleValue}</div>
          <div className="text-xs text-gray-600 text-left">{layerTitle}</div>
          <div className="text-sm text-left">{descriptionValue}</div>
          <div className="flex flex-row justify-center">
            <div className="flex justify-center m-2">
              {resource.download_url === undefined
                ? undefined
                : largeDownloadIcon(resource.download_url)}
            </div>
            {/* <div className="flex justify-center m-2">
              {resource.download_url === undefined ? undefined : shareIcon(resource.download_url)}
            </div>
            <div className="flex justify-center m-2">
              {resource.download_url === undefined ? undefined : linkIcon(resource.download_url)}
            </div> */}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {summary()}
      {infolabels.length > 0 ? (
        <Collapsible
          trigger="詳細情報"
          triggerClassName="text-white bg-blue-500 hover:opacity-75 text-sm p-1 text-center absolute w-full"
          triggerOpenedClassName="text-white bg-blue-500 hover:opacity-75 text-sm p-1 text-center absolute w-full"
        >
          <table className="mt-8 tooltip_table m-2">
            <tbody>
              {infolabels.map((key) => {
                const value = String(properties[key]);

                let content: JSX.Element | string;
                content = value;
                if (key === 'URL' || key === '関連URL') {
                  content = (
                    <a
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                      href={value}
                      target="TOP"
                    >
                      {value}
                    </a>
                  );
                }
                if (key === 'HP' || key === 'YouTubeリンク') {
                  content = (
                    <a
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                      href={value}
                      target="TOP"
                    >
                      リンク
                    </a>
                  );
                }

                return (
                  <tr key={key}>
                    <td className="whitespace-nowrap font-bold align-top">{key}</td>
                    <td className="whitespace-nomal break-all" style={tdStyle}>
                      {content}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Collapsible>
      ) : undefined}
    </>
  );
};

const TooltipTableBody: VFC<TooltipTableBodyProps> = ({ properties, labels, id }) => {
  //todo jsonに移動
  const summaryKey = {
    title: ['旧市区町村名'],
    dataset: [''],
    resource: [''],
  };

  const Summary = () => {
    const { preferences } = useContext(context);
    const layerTitle = getDataTitleById(preferences.menu, id);
    const layerCategory = getCategoryByTitle(preferences.menu, layerTitle);

    const titleValue =
      properties[
        labels.filter((key) => {
          return summaryKey.title.indexOf(key) > -1;
        })[0]
      ];

    return (
      <>
        <div>{titleValue}</div>
        <div>{layerCategory}</div>
        <div>{layerTitle}</div>
      </>
    );
  };

  return (
    <>
      {Summary()}
      <table className="tooltip_table">
        <tbody>
          {labels.map((key) => {
            const summaryKeys = Object.keys(summaryKey)
              .map((key) => {
                return summaryKey[key];
              })
              .flat();
            const value = String(properties[key]);

            let content: JSX.Element | string;
            if (summaryKeys.indexOf(key) > -1) {
              return;
            } else {
              content = value;
            }

            return (
              <tr key={key}>
                <td className="whitespace-nowrap font-bold align-top">{key}</td>
                <td className="whitespace-nomal break-all" style={tdStyle}>
                  {content}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
