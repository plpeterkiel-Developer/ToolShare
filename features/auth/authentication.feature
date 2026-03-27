Feature: Authentication
  As a user of ToolShare
  I want to register, log in, and log out
  So that I can access my account and protect my data

  Background:
    Given the application is running

  @smoke
  Scenario: Successful registration
    When I navigate to "/da/auth/signup"
    And I fill in the signup form with a new user
    And I submit the signup form
    Then I should be redirected to a dashboard or home page
    And I should see my display name in the navigation

  Scenario: Registration with duplicate email
    Given a user already exists with email "duplicate@test.toolshare.app"
    When I navigate to "/da/auth/signup"
    And I fill in the signup form with email "duplicate@test.toolshare.app"
    And I submit the signup form
    Then I should see an error message containing "already registered"

  @smoke
  Scenario: Successful login with valid credentials
    Given a registered user exists
    When I navigate to "/da/auth/login"
    And I fill in the login form with valid credentials
    And I submit the login form
    Then I should be redirected to a dashboard or home page
    And I should see my display name in the navigation

  Scenario: Login with wrong password
    Given a registered user exists
    When I navigate to "/da/auth/login"
    And I fill in the login form with the wrong password
    And I submit the login form
    Then I should see an error message containing "Invalid"

  Scenario: Successful logout
    Given I am logged in as a registered user
    When I click the logout button
    Then I should be redirected to the home page
    And I should see the login link in the navigation

  Scenario: Unauthenticated redirect to login
    Given I am not logged in
    When I navigate to "/da/profile"
    Then I should be redirected to the login page
