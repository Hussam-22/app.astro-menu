import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { m, AnimatePresence } from 'framer-motion';

import { Grid } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import EmptyContent from 'src/components/empty-content';
import { MotionViewport } from 'src/components/animate';
import { rdxGetMenuSections } from 'src/redux/slices/menu';
import AddSection from 'src/sections/menu/meals-and-sections/sections/AddSection';
import SectionMeals from 'src/sections/menu/meals-and-sections/sections/SectionMeals';

function MealsAndSections() {
  const dispatch = useDispatch();
  const { id: menuID } = useParams();
  const { fsGetAllMeals, fsGetSections } = useAuthContext();

  const { data: sections = [] } = useQuery({
    queryKey: [`sections-${menuID}`],
    queryFn: () => fsGetSections(menuID),
  });

  const { data: allMeals = [] } = useQuery({
    queryKey: [`meals`],
    queryFn: fsGetAllMeals,
  });

  useEffect(() => {
    dispatch(rdxGetMenuSections(sections));
  }, [sections, dispatch]);

  // useEffect(() => {
  //   dispatch(rdxGetAllMeals(allMeals));
  // }, [dispatch, allMeals]);

  const sectionsLength = sections.length;
  const noData = sectionsLength === 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AddSection sectionsLength={sectionsLength} sections={sections} />
      </Grid>

      <Grid item xs={12}>
        <MotionViewport>
          <AnimatePresence>
            {!noData &&
              [...sections]
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <m.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    exit={{ opacity: 0 }}
                    key={section.docID}
                    layout
                  >
                    <SectionMeals
                      id={section.docID}
                      menuID={menuID}
                      isLast={sectionsLength - 1 === index}
                      isFirst={index === 0}
                      sectionInfo={section}
                      allMeals={allMeals}
                    />
                  </m.div>
                ))}
          </AnimatePresence>
        </MotionViewport>

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
