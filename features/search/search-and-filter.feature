Feature: Search and filter tools
  As a visitor
  I want to search and filter the tool listings
  So that I can quickly find the tool I need

  Background:
    Given the application is running
    And multiple tools have been seeded with different categories

  Scenario: Search by keyword finds matching tools
    When I navigate to "/da/tools"
    And I type "drill" in the search box
    And I submit the search
    Then I should see tool cards matching "drill"
    And I should not see tool cards unrelated to "drill"

  Scenario: Search with no results shows empty state
    When I navigate to "/da/tools"
    And I type "zzznoresultszzz" in the search box
    And I submit the search
    Then I should see the empty state message

  Scenario: Filter by category shows only matching tools
    When I navigate to "/da/tools"
    And I select the category "Gardening"
    Then I should see only tools in the "Gardening" category
    And I should not see tools in other categories

  Scenario: Combine search and category filter
    When I navigate to "/da/tools"
    And I type "spade" in the search box
    And I submit the search
    And I select the category "Gardening"
    Then I should see only tools matching both criteria

  Scenario: Unavailable tools are excluded from browse results
    Given there is an unavailable tool in the database
    When I navigate to "/da/tools"
    Then I should not see the unavailable tool in the results

  Scenario: Clear search resets results
    Given I have searched for "drill"
    When I click the clear search button
    Then I should see all available tools again
    And the search input should be empty

  Scenario: Category filter shows a pill button for each category
    When I navigate to "/da/tools"
    Then I should see category filter buttons
    And I should see an "All" category option
