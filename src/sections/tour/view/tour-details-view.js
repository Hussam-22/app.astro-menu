import { useState, useCallback } from 'react';

// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

// routes
import { paths } from 'src/routes/paths';
// components
import Label from 'src/components/label';
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
// _mock
import { _tours, TOUR_DETAILS_TABS, TOUR_PUBLISH_OPTIONS } from 'src/_mock';

import TourDetailsBookers from '../tour-details-bookers';
//
import TourDetailsToolbar from '../tour-details-toolbar';
import TourDetailsContent from '../tour-details-content';

// ----------------------------------------------------------------------

export default function TourDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const currentTour = _tours.filter((tour) => tour.id === id)[0];

  const [publish, setPublish] = useState(currentTour?.publish);

  const [currentTab, setCurrentTab] = useState('content');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {TOUR_DETAILS_TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            tab.value === 'bookers' ? (
              <Label variant="filled">{currentTour?.bookers.length}</Label>
            ) : (
              ''
            )
          }
        />
      ))}
    </Tabs>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <TourDetailsToolbar
        backLink={paths.dashboard.tour.root}
        editLink={paths.dashboard.tour.edit(`${currentTour?.id}`)}
        liveLink="#"
        publish={publish || ''}
        onChangePublish={handleChangePublish}
        publishOptions={TOUR_PUBLISH_OPTIONS}
      />
      {renderTabs}

      {currentTab === 'content' && <TourDetailsContent tour={currentTour} />}

      {currentTab === 'bookers' && <TourDetailsBookers bookers={currentTour?.bookers} />}
    </Container>
  );
}
