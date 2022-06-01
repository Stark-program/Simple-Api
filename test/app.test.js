const request = require("supertest");
const app = require("../app");

describe("GET /ping", function () {
  it("Respond with ping from api", function (done) {
    request(app).get("/api/ping").expect(200, done);
  });
});

function checkSort(res, key, condition) {
  let responsePosts = res._body.finalPosts;
  let firstIndex = responsePosts[0][key];
  let lastIndex = responsePosts[responsePosts.length - 1][key];
  if (!condition(firstIndex, lastIndex))
    throw new Error("Posts not sorted properly");
}
describe("GET /api/posts sorted by popularity in ascending order", function () {
  it("Responds with posts sorted in ascending order by popularity", function (done) {
    request(app)
      .get("/api/posts")
      .query({ tag: "tech", direction: "asc", sortBy: "popularity" })
      .expect("Content-Type", /json/)
      .expect(function (res) {
        checkSort(
          res,
          "popularity",
          (firstIndex, lastIndex) => firstIndex < lastIndex
        );
      })
      .expect(200, done);
  });
});

describe("GET /api/posts sorted by likes in descending order", function () {
  it("Responds with posts sorted in descending order by likes", function (done) {
    request(app)
      .get("/api/posts")
      .query({
        tag: "tech,health,startup",
        direction: "desc",
        sortBy: "likes",
      })
      .expect("Content-Type", /json/)
      .expect(function (res) {
        checkSort(
          res,
          "likes",
          (firstIndex, lastIndex) => firstIndex > lastIndex
        );
      })
      .expect(200, done);
  });
});

describe("GET /api/posts sorted by ID in ascending order", function () {
  it("Responds with posts sorted in ascending order by ID", function (done) {
    request(app)
      .get("/api/posts")
      .query({
        tag: "tech,health",
      })
      .expect("Content-Type", /json/)
      .expect(function (res) {
        checkSort(res, "id", (firstIndex, lastIndex) => firstIndex < lastIndex);
      })
      .expect(200, done);
  });
});

describe("GET /api/posts with no tag", function () {
  it("Responds with error code for having no required tag", function (done) {
    request(app)
      .get("/api/posts")
      .query({
        tag: undefined,
      })
      .expect("Content-Type", /json/)
      .expect(400, done);
  });
});

describe("GET /api/posts with wrong value for sortBy", function () {
  it("Responds with error code for having wrong sortBy value", function (done) {
    request(app)
      .get("/api/posts")
      .query({
        tag: "tech",
        sortBy: "length",
      })
      .expect("Content-Type", /json/)
      .expect(400, done);
  });
});

describe("GET /api/posts with wrong value for direction", function () {
  it("Responds with error code for having wrong direction value", function (done) {
    request(app)
      .get("/api/posts")
      .query({
        tag: "tech",
        direction: "top",
      })
      .expect("Content-Type", /json/)
      .expect(400, done);
  });
});
