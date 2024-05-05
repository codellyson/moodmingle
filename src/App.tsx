import type { LoaderFunctionArgs } from "react-router-dom";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
  useActionData,
  useFetcher,
  useLocation,
  useNavigation,
  useRouteLoaderData,
} from "react-router-dom";
import { fakeAuthProvider } from "./auth";
import "@mantine/core/styles.css";

import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  MantineProvider,
  Paper,
  Stack,
  Text,
  TextInput,
  rem,
} from "@mantine/core";

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    loader() {
      // Our root route always provides the user, if logged in
      return { user: fakeAuthProvider.username };
    },
    Component: Layout,
    children: [
      {
        index: true,
        Component: PublicPage,
      },
      {
        path: "login",
        action: loginAction,
        loader: loginLoader,
        Component: LoginPage,
      },
      {
        path: "protected",
        loader: protectedLoader,
        Component: ProtectedPage,
      },
    ],
  },
  {
    path: "/logout",
    async action() {
      // We signout in a "resource route" that we can hit from a fetcher.Form
      await fakeAuthProvider.signout();
      return redirect("/");
    },
  },
]);

export default function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <RouterProvider
        router={router}
        fallbackElement={<p>Initial Load...</p>}
      />
    </MantineProvider>
  );
}

function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

function AuthStatus() {
  // Get our logged in user, if they exist, from the root route loader data
  let { user } = useRouteLoaderData("root") as { user: string | null };
  let fetcher = useFetcher();

  if (!user) {
    return <p>You are not logged in.</p>;
  }

  let isLoggingOut = fetcher.formData != null;

  return (
    <div>
      <p>Welcome {user}!</p>
      <fetcher.Form method="post" action="/logout">
        <button type="submit" disabled={isLoggingOut}>
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </fetcher.Form>
    </div>
  );
}

async function loginAction({ request }: LoaderFunctionArgs) {
  let formData = await request.formData();
  let username = formData.get("username") as string | null;

  // Validate our form inputs and return validation errors via useActionData()
  if (!username) {
    return {
      error: "You must provide a username to log in",
    };
  }

  // Sign in and redirect to the proper destination if successful.
  try {
    await fakeAuthProvider.signin(username);
  } catch (error) {
    // Unused as of now but this is how you would handle invalid
    // username/password combinations - just like validating the inputs
    // above
    return {
      error: "Invalid login attempt",
    };
  }

  let redirectTo = formData.get("redirectTo") as string | null;
  return redirect(redirectTo || "/");
}

async function loginLoader() {
  if (fakeAuthProvider.isAuthenticated) {
    return redirect("/");
  }
  return null;
}

function LoginPage() {
  let location = useLocation();
  let params = new URLSearchParams(location.search);
  let from = params.get("from") || "/";

  let navigation = useNavigation();
  let isLoggingIn = navigation.formData?.get("username") != null;

  let actionData = useActionData() as { error: string } | undefined;

  return (
    <Container size="sm" h="100vh">
      <Stack justify="center" align="center" h="100%">
        <Paper
          shadow="xs"
          p="lg"
          radius="md"
          style={{
            maxWidth: "400px",
            width: "100%",
            margin: "auto",
          }}
        >
          <Form method="post" replace>
            <Stack>
              <input type="hidden" name="redirectTo" value={from} />
              <TextInput
                name="username"
                placeholder="Enter your username"
                label="Username"
              />

              <Button
                variant="gradient"
                gradient={{ from: "blue", to: "green" }}
                size="lg"
                radius="md"
                type="submit"
                disabled={isLoggingIn}
                fullWidth
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
              {actionData && actionData.error ? (
                <p style={{ color: "red" }}>{actionData.error}</p>
              ) : null}

              <Group   justify="space-between">
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign up</Link>
                </Group>
            </Stack>
          </Form>
        </Paper>
      </Stack>
    </Container>
  );
}

const services = [
  {
    name: "Mood Tracking",
    description: "Track your emotions and identify patterns",
  },
  {
    name: "Community Support",
    description: "Connect with others who understand what you're going through",
  },
  {
    name: "Resources",
    description:
      "Access expert advice, articles, and tips for managing your emotions",
  },
  {
    name: "Mood Journaling",
    description: "Write about your day and reflect on your feelings",
  },
];

const testimonials = [
  {
    image: "user1.png",
    text: "MoodMingle has helped me understand my emotions better and connect with others who get it.",
  },
  {
    image: "user2.png",
    text: "I was struggling with anxiety, but MoodMingle's resources and community support helped me find peace.",
  },

  {
    image: "user3.png",
    text: "I've been using MoodMingle for a few months now and it's really helped me stay on top of my mental health.",
  },
  {
    image: "user4.png",
    text: "I love the community on MoodMingle. It's so nice to know that I'm not alone in my struggles.",
  },
];

const serviceColumns = services.map((service) => (
  <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
    <Card radius="md" p="lg" shadow="sm">
      <Text size="md" fw="bold" mb="sm">
        {service.name}
      </Text>
      <Text size="sm" color="gray" mb="sm">
        {service.description}
      </Text>
    </Card>
  </Grid.Col>
));

const testimonialCards = testimonials.map((testimonial) => (
  <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
    <Card radius="md" p="lg" shadow="sm">
      <Image src={testimonial.image} alt="User" radius="md" mb="sm" />
      <Text size="sm" color="gray" mb="sm">
        "{testimonial.text}"
      </Text>
    </Card>
  </Grid.Col>
));

function PublicPage() {
  return (
    <Container size="lg" pos="relative">
      {" "}
      <Image
        src="https://img.freepik.com/free-photo/still-life-with-human-brains-geometric-shapes_23-2150547720.jpg?t=st=1714869041~exp=1714872641~hmac=135d918e1fbc9ee2a36b96b6a38bd9fc3ab0154ef90d8fdfe33ae6e74b4b392e&w=1380"
        alt="Stylized brain with emotive icons"
        mx="auto"
      />
      <Stack
        align="center"
        pos="absolute"
        top="20%"
        bg="rgba(255, 255, 255, 0.9)"
        w="100%"
        p={"lg"}
      >
        <Text size={rem(30)} fw="bold" ta="center">
          Take control of your emotions
        </Text>
        <Text size="md" ta="center" color="gray" fw="bold">
          Join the MoodMingle community to track your mood, connect with others,
          and find support
        </Text>
        <NavLink to={"/login"}>
          <Button
            variant="gradient"
            gradient={{ from: "blue", to: "green" }}
            size="lg"
            radius="md"
          >
            Get Started
          </Button>
        </NavLink>
      </Stack>
      <Stack my="xl">
        <Text size="xl" ta="center" fw="bolder" mb="xl">
          What we offer
        </Text>
        <Grid gutter="xl" mb="xl">
          {serviceColumns}
        </Grid>
      </Stack>
      <Stack my="xl">
        <Text size="xl" ta="center" fw="bolder" mb="xl">
          Hear from our users
        </Text>
        <Grid gutter="xl" mb="xl">
          {testimonialCards}
        </Grid>
      </Stack>
      {/* newsletter */}
      <Stack justify="center" my="xl">
        <Text size="xl" ta="center" fw="bolder">
          Stay up to date
        </Text>
        <form>
          <Stack maw={{ base: "100%", md: "50%" }} mx="auto">
            <TextInput
              type="email"
              placeholder="Enter your email"
              style={{ padding: "0.5rem" }}
            />
            <Button
              variant="gradient"
              gradient={{ from: "blue", to: "green" }}
              radius="md"
            >
              Subscribe
            </Button>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}

function protectedLoader({ request }: LoaderFunctionArgs) {
  // If the user is not logged in and tries to access `/protected`, we redirect
  // them to `/login` with a `from` parameter that allows login to redirect back
  // to this page upon successful authentication
  if (!fakeAuthProvider.isAuthenticated) {
    let params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/login?" + params.toString());
  }
  return null;
}

function ProtectedPage() {
  return <h3>Protected</h3>;
}
