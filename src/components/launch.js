import { useParams, Link as RouterLink } from "react-router-dom";
import { format as timeAgo } from "timeago.js";
import { Watch, MapPin, Navigation, Package, Maximize2 } from "react-feather";
import {
  Flex,
  Heading,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Box,
  Text,
  Spinner,
  Image,
  Link,
  Stack,
  AspectRatio,
  StatGroup,
  Tooltip,
} from "@chakra-ui/react";

import { useSpaceXQuery } from "../utils/use-space-x";
import { formatDateTime } from "../utils/format-date";
import Error from "./error";
import Breadcrumbs from "./breadcrumbs";

const numberFormatter = new Intl.NumberFormat();

export default function Launch() {
  let { launchId } = useParams();
  const { data, error } = useSpaceXQuery("launches", {
    query: { _id: launchId },
    options: { populate: ["rocket", "launchpad"] },
  });
  const launch = data?.docs[0];

  if (error) return <Error />;
  if (!launch) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="50vh">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Launches", to: "/launches" },
          { label: `#${launch.flight_number}` },
        ]}
      />
      <Header launch={launch} />
      <Box m={[3, 6]}>
        <TimeAndLocation launch={launch} />
        <RocketInfo launch={launch} />
        <Text color="gray.700" fontSize={["md", null, "lg"]} my="8">
          {launch.details}
        </Text>
        <Video launch={launch} />
        <Gallery images={launch.links.flickr.original} />
      </Box>
    </div>
  );
}

function Header({ launch }) {
  return (
    <Flex
      bgImage={`url(${launch.links.flickr.original[0]})`}
      bgPos="center"
      bgSize="cover"
      bgRepeat="no-repeat"
      minHeight="30vh"
      position="relative"
      p={[2, 6]}
      alignItems="flex-end"
      justifyContent="space-between"
    >
      <Image
        position="absolute"
        top="5"
        right="5"
        src={launch.links.patch.small}
        height={["85px", "150px"]}
        objectFit="contain"
        objectPosition="bottom"
      />
      <Heading
        color="white"
        display="inline"
        backgroundColor="#718096b8"
        fontSize={["lg", "5xl"]}
        px="4"
        py="2"
        borderRadius="lg"
      >
        {launch.name}
      </Heading>
      <Stack isInline spacing="3">
        <Badge colorScheme="purple" fontSize={["xs", "md"]}>
          #{launch.flight_number}
        </Badge>
        {launch.success ? (
          <Badge colorScheme="green" fontSize={["xs", "md"]}>
            Successful
          </Badge>
        ) : (
          <Badge colorScheme="red" fontSize={["xs", "md"]}>
            Failed
          </Badge>
        )}
      </Stack>
    </Flex>
  );
}

function TimeAndLocation({ launch }) {
  return (
    <SimpleGrid columns={[1, 1, 2]} borderWidth="1px" p="4" borderRadius="md">
      <Stat>
        <StatLabel display="flex">
          <Box as={Watch} width="1em" />{" "}
          <Box ml="2" as="span">
            Launch Date
          </Box>
        </StatLabel>
        <Tooltip label={`${formatDateTime(launch.date_local)} (Your local timezone)`}>
            <StatNumber fontSize={["md", "xl"]}>
              {formatDateTime(launch.date_local, launch.launchpad.timezone)}
            </StatNumber>
        </Tooltip>
        <StatHelpText>{timeAgo(launch.date_utc)}</StatHelpText>
      </Stat>
      <Stat>
        <StatLabel display="flex">
          <Box as={MapPin} width="1em" />{" "}
          <Box ml="2" as="span">
            Launch Site
          </Box>
        </StatLabel>
        <StatNumber fontSize={["md", "xl"]}>
          <Link as={RouterLink} to={`/launch-pads/${launch.launchpad.id}`}>
            {launch.launchpad.full_name}
          </Link>
        </StatNumber>
        <StatHelpText>{launch.launchpad.name}</StatHelpText>
      </Stat>
    </SimpleGrid>
  );
}

function RocketInfo({ launch }) {
  return (
    <SimpleGrid
      columns={[1, 1, 2]}
      borderWidth="1px"
      mt="4"
      p="4"
      borderRadius="md"
    >
      <Stat>
        <StatLabel display="flex">
          <Box as={Navigation} width="1em" />{" "}
          <Box ml="2" as="span">
            Rocket
          </Box>
        </StatLabel>
        <StatNumber fontSize={["md", "xl"]}>{launch.rocket.name}</StatNumber>
        <StatHelpText>
          {launch.rocket.success_rate_pct}% success rate
        </StatHelpText>
      </Stat>
      <StatGroup>
        <Stat>
          <StatLabel display="flex">
            <Box as={Maximize2} width="1em" />{" "}
            <Box ml="2" as="span">
              Height
            </Box>
          </StatLabel>
          <StatNumber fontSize={["md", "xl"]}>
            {numberFormatter.format(launch.rocket.height.meters)} m
          </StatNumber>
          <StatHelpText>
            {numberFormatter.format(launch.rocket.height.feet)} ft
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel display="flex">
            <Box as={Package} width="1em" />{" "}
            <Box ml="2" as="span">
              Mass
            </Box>
          </StatLabel>
          <StatNumber fontSize={["md", "xl"]}>
            {numberFormatter.format(launch.rocket.mass.kg)} kg
          </StatNumber>
          <StatHelpText>
            {numberFormatter.format(launch.rocket.mass.lb)} lb.
          </StatHelpText>
        </Stat>
      </StatGroup>
    </SimpleGrid>
  );
}

function Video({ launch }) {
  return (
    <AspectRatio maxH="400px" ratio={1.7}>
      <Box
        as="iframe"
        title={launch.name}
        src={`https://www.youtube.com/embed/${launch.links.youtube_id}`}
        allowFullScreen
      />
    </AspectRatio>
  );
}

function Gallery({ images }) {
  return (
    <SimpleGrid my="6" minChildWidth="350px" spacing="4">
      {images.map((src) => (
        <a href={src} key={src}>
          <Image src={src} />
        </a>
      ))}
    </SimpleGrid>
  );
}
