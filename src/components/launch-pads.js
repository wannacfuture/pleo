import { Badge, Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, IconButton, Input, SimpleGrid, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import Error from "./error";
import Breadcrumbs from "./breadcrumbs";
import LoadMoreButton from "./load-more-button";
import { useSpaceXPaginatedQuery } from "../utils/use-space-x";
import { useEffect, useState } from "react";
import { addItem, getItems, removeItem } from "../utils/storage";
import { StarIcon } from "@chakra-ui/icons";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 12;

export default function LaunchPads() {
  const { data, error, isValidating, setSize } = useSpaceXPaginatedQuery(
    "launchpads",
    {
      query: { upcoming: false },
      options: {
        limit: PAGE_SIZE,
        populate: ["rockets"],
        sort: { full_name: "asc" },
      },
    }
  );
  const [favorites, setFavorites] = useState(getItems("launch-pads"));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);

  const navigate = useNavigate();

  useEffect( ()=> {

    const uppderCasedQuery = debouncedSearchQuery.toUpperCase();
    const res = (data ?? [])
    .map((page) => page.docs)
    .flat()
    .filter(launchPad => launchPad.full_name.toUpperCase().includes(uppderCasedQuery) || launchPad.rockets.map((r) => r.name).join(", ").toUpperCase().includes(uppderCasedQuery));
    console.log(res);
    setFilteredData(res);
  },[data,debouncedSearchQuery])

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Launch Pads" }]}
      />
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <Button variant='outline' ml={6} onClick={() => setIsDrawerOpen(true)}>
          Show Favorites
        </Button>
        <Input placeholder="Search everything" w={300} mr={6} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}></Input>
      </div>
      <SimpleGrid m={[2, null, 6]} minChildWidth="350px" spacing="4">
        {error && <Error />}
        {filteredData
          .map((launchPad) => (
            <LaunchPadItem key={launchPad.id} launchPad={launchPad} isFavorite={favorites.includes(launchPad.id)} onStarClick={() => {
              const isAlreadyIncluded = favorites.includes(launchPad.id);
              if(isAlreadyIncluded) removeItem("launch-pads", launchPad.id);
              else addItem("launch-pads", launchPad.id)
              setFavorites(getItems("launch-pads"));
            }} />
          ))}
      </SimpleGrid>
      <LoadMoreButton
        loadMore={() => setSize((size) => size + 1)}
        data={data}
        pageSize={PAGE_SIZE}
        isLoadingMore={isValidating}
      />
      <Drawer
        isOpen={isDrawerOpen}
        placement='right'
        onClose={() => setIsDrawerOpen(false)}
      >
        <DrawerOverlay />
        <DrawerContent w={700} maxWidth={700}>
          <DrawerCloseButton />
          <DrawerHeader>Favorite Launch Pads({`${favorites.length}`})</DrawerHeader>

          <DrawerBody>
            {
              data
              ?.map((page) => page.docs)
              .flat()
              .filter(item => favorites.includes(item.id))
              .map(launchPad => {
                return (
                  <Box
                    onClick={() => navigate(`/launch-pads/${launchPad.id}`)}
                    boxShadow="md"
                    borderWidth="1px"
                    rounded="lg"
                    overflow="hidden"
                    position="relative"
                    cursor={"pointer"}
                  >
                    <Box p="6">
                      <Box d="flex" alignItems="baseline">
                        {launchPad.status === "active" ? (
                          <Badge px="2" variant="solid" colorScheme="green">
                            Active
                          </Badge>
                        ) : (
                          <Badge px="2" variant="solid" colorScheme="red">
                            Retired
                          </Badge>
                        )}
                        <Box
                          color="gray.500"
                          fontWeight="semibold"
                          letterSpacing="wide"
                          fontSize="xs"
                          textTransform="uppercase"
                          ml="2"
                        >
                          {launchPad.launch_attempts} attempted &bull;{" "}
                          {launchPad.launch_successes} succeeded
                        </Box>
                      </Box>

                      <Box
                        mt="1"
                        fontWeight="semibold"
                        as="h4"
                        lineHeight="tight"
                        isTruncated
                      >
                        {launchPad.full_name}
                      </Box>
                      <Text color="gray.500" fontSize="sm">
                        {launchPad.rockets.map((r) => r.name).join(", ")}
                      </Text>
                      <Button
                        variant='ghost'
                        aria-label='Call Sage'
                        fontSize='15px'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem("launch-pads",launchPad.id);
                          setFavorites(getItems("launch-pads"));
                        }}
                        right={0}
                        bottom={0}
                        margin={1}
                        position={"absolute"}
                      >Remove</Button>
                    </Box>
                  </Box>
                )
              }
              )
            }
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function LaunchPadItem({ launchPad, isFavorite, onStarClick }) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/launch-pads/${launchPad.id}`)}
      boxShadow="md"
      borderWidth="1px"
      rounded="lg"
      overflow="hidden"
      position="relative"
      cursor={"pointer"}
    >
      <Box p="6">
        <Box d="flex" alignItems="baseline">
          {launchPad.status === "active" ? (
            <Badge px="2" variant="solid" colorScheme="green">
              Active
            </Badge>
          ) : (
            <Badge px="2" variant="solid" colorScheme="red">
              Retired
            </Badge>
          )}
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {launchPad.launch_attempts} attempted &bull;{" "}
            {launchPad.launch_successes} succeeded
          </Box>
        </Box>

        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {launchPad.full_name}
        </Box>
        <Text color="gray.500" fontSize="sm">
          {launchPad.rockets.map((r) => r.name).join(", ")}
        </Text>
        <IconButton
            variant='ghost'
            aria-label='Call Sage'
            fontSize='20px'
            colorScheme="yellow"
            onClick={(e) => {
              e.stopPropagation();
              onStarClick();
            }}
            right={0}
            bottom={0}
            margin={1}
            position={"absolute"}
            icon={<StarIcon fillOpacity={isFavorite ? 20 : 0} stroke={"black"}/>}
          />
      </Box>
    </Box>
  );
}
