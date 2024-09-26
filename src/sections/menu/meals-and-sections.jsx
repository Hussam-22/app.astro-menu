import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Box, Grid } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import EmptyContent from 'src/components/empty-content';
import AddSection from 'src/sections/menu/meals-and-sections/sections/AddSection';
import SectionMeals from 'src/sections/menu/meals-and-sections/sections/SectionMeals';

function MealsAndSections() {
  const { id: menuID } = useParams();
  const { fsGetAllMeals, fsGetSections, menuSections } = useAuthContext();

  console.log(menuSections);

  const { data: sectionsUnsubscribe = () => {}, error } = useQuery({
    queryKey: ['sections', menuID],
    queryFn: () => fsGetSections(menuID),
  });

  const { data: allMeals = [] } = useQuery({
    queryKey: [`meals`],
    queryFn: () => fsGetAllMeals(),
  });

  useEffect(
    () => () => {
      if (typeof sectionsUnsubscribe === 'function') {
        sectionsUnsubscribe();
      }
    },
    [sectionsUnsubscribe]
  );

  const sectionsLength = menuSections.length;
  const noData = sectionsLength === 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AddSection sectionsLength={sectionsLength} sections={menuSections} />
      </Grid>

      <Grid item xs={12}>
        {!noData &&
          [...menuSections]
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <Box key={section.docID}>
                <SectionMeals
                  id={section.docID}
                  menuID={menuID}
                  isLast={sectionsLength - 1 === index}
                  isFirst={index === 0}
                  sectionInfo={section}
                  allMeals={allMeals}
                  allSections={menuSections}
                />
              </Box>
            ))}

        {noData && (
          <EmptyContent
            title="No Menu Sections"
            description="Please add sections to add meals to menu"
            sx={{
              '& span.MuiBox-root': { height: 160 },
            }}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default MealsAndSections;
