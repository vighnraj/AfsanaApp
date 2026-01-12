import { useRef, useContext } from 'react';
import { getTabScreenOptions } from '../navigation/navigationStyles';

export const useScrollToHideTabs = (navigation) => {
    const offset = useRef(0);

    const onScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const direction = currentOffset > offset.current && currentOffset > 0 ? 'down' : 'up';
        offset.current = currentOffset;

        if (direction === 'down') {
            navigation.setOptions({
                tabBarStyle: { display: 'none' },
            });
        } else {
            navigation.setOptions({
                ...getTabScreenOptions(),
            });
        }
    };

    return { onScroll };
};
