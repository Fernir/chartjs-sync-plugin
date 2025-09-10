if (typeof Chart !== 'undefined') {
    const ChartjsSyncPlugin = {
        id: 'chartjs-sync-tooltips',

        afterInit(chart) {
            const options = chart.config.options?.plugins?.sync;
            if (!options?.enabled) return;

            const { group } = options;

            const handleSync = (e) => {
                const { chartId, syncGroup, xValue } = e.detail;
                if (chartId === chart.id || syncGroup !== group) return;

                const xScale = chart.scales?.x || chart.scales[chart.getDatasetMeta(0).xAxisID];
                const { labels } = chart.data;
                if (!xScale || !labels || labels.length === 0) return;

                // Определяем, числа или даты
                const isNumber = typeof labels[0] === 'number';
                const eventValue = isNumber ? xValue : new Date(xValue).getTime();

                let left = 0;
                let right = labels.length - 1;
                let targetIndex = 0;
                let minDiff = Infinity;

                while (left <= right) {
                    const mid = Math.floor((left + right) / 2);
                    const labelValue = isNumber ? labels[mid] : new Date(labels[mid]).getTime();
                    const diff = Math.abs(labelValue - eventValue);

                    if (diff < minDiff) {
                        minDiff = diff;
                        targetIndex = mid;
                    }

                    if (labelValue < eventValue) left = mid + 1;
                    else if (labelValue > eventValue) right = mid - 1;
                    else break;
                }

                // Активируем все dataset с данными на targetIndex
                const activeElements = chart.data.datasets
                    .map((dataset, datasetIndex) =>
                        dataset.data && targetIndex < dataset.data.length ? { datasetIndex, index: targetIndex } : null,
                    )
                    .filter(Boolean);

                chart.tooltip.setActiveElements(activeElements, {
                    x: xScale.getPixelForValue(labels[targetIndex]),
                    y: null,
                });

                chart.update();
            };

            const handleHide = (e) => {
                const { chartId, syncGroup } = e.detail;
                if (chartId === chart.id || syncGroup !== group) return;
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                chart.update();
            };

            chart._sync = { group, handleSync, handleHide };
            window.addEventListener('sync-event', handleSync);
            window.addEventListener('sync-hide', handleHide);
        },

        afterDestroy(chart) {
            if (!chart._sync) return;
            const { handleSync, handleHide } = chart._sync;
            window.removeEventListener('sync-event', handleSync);
            window.removeEventListener('sync-hide', handleHide);
        },

        afterEvent(chart, args) {
            const e = args.event;
            const options = chart.config.options.plugins?.sync;
            if (!options?.enabled || !chart.scales) return;

            const activeElements = chart.tooltip?.getActiveElements?.() || [];
            if (activeElements.length === 0 && !e.stop) {
                window.dispatchEvent(
                    new CustomEvent('sync-hide', {
                        detail: { chartId: chart.id, syncGroup: options.group },
                    }),
                );
                return;
            }

            const targetIndex = activeElements[0]?.index;
            if (typeof targetIndex !== 'number') return;

            const label = chart.data.labels[targetIndex];
            if (label == null) return;

            const labelTime = typeof label === 'string' ? new Date(label).getTime() : label;

            if (!e.stop) {
                window.dispatchEvent(
                    new CustomEvent('sync-event', {
                        detail: { chartId: chart.id, syncGroup: options.group, original: e, xValue: labelTime },
                    }),
                );
            }
        },

        beforeTooltipDraw() {
            return true;
        },
    };

    Chart.register(ChartjsSyncPlugin);
}
